import { db, schema } from "@/lib/db"
import { logJobEvent } from "@/lib/db/events"
import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"
import type { NextRequest } from "next/server"
import type { Job, SurveyRoom, InventoryItem } from "@/lib/types"
import { calculateJob, } from "@/lib/calculator"

export const dynamic = "force-dynamic"

/** POST /api/jobs/[id]/offer — generate an offer from survey data */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: jobId } = await params

  // Optional custom price from request body
  let customPrice: number | null = null
  try {
    const body = await request.json()
    if (body.customPrice && typeof body.customPrice === "number" && body.customPrice > 0) {
      customPrice = body.customPrice
    }
  } catch { /* empty body is fine */ }

  // Load job
  const [jobRow] = await db
    .select()
    .from(schema.jobs)
    .where(eq(schema.jobs.id, jobId))
    .limit(1)

  if (!jobRow) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  // Load rooms + items
  const rooms = await db
    .select()
    .from(schema.jobRooms)
    .where(eq(schema.jobRooms.jobId, jobId))
    .orderBy(schema.jobRooms.sortOrder)

  const surveyRooms: SurveyRoom[] = await Promise.all(
    rooms.map(async (room) => {
      const items = await db
        .select()
        .from(schema.jobItems)
        .where(eq(schema.jobItems.roomId, room.id))

      return {
        id: room.id,
        type: room.type as SurveyRoom["type"],
        customName: room.customName ?? undefined,
        mode: room.mode as SurveyRoom["mode"],
        percent: room.percent,
        items: items.map((i): InventoryItem => ({
          id: i.id,
          catalogId: i.catalogId,
          quantity: i.quantity,
          services: {
            disassembly: i.disassembly,
            packing: i.packing,
            assembly: i.assembly,
          },
          notes: i.notes ?? undefined,
        })),
      }
    }),
  )

  if (surveyRooms.length === 0) {
    return Response.json({ error: "No survey data" }, { status: 400 })
  }

  // Build Job object for calculator
  const jobForCalc: Job = {
    mode: "quick",
    jobType: jobRow.jobType as Job["jobType"],
    vehicleId: jobRow.vehicleId as Job["vehicleId"],
    client: { name: "", phone: "", email: "" },
    pickup: { address: jobRow.pickupAddress, floor: jobRow.pickupFloor, elevator: jobRow.pickupElevator },
    delivery: { address: jobRow.deliveryAddress, floor: jobRow.deliveryFloor, elevator: jobRow.deliveryElevator },
    distance: Number(jobRow.distance),
    date: jobRow.date || "",
    rooms: [],
    quickRooms: [],
    surveyRooms,
    materials: (jobRow.materials as Job["materials"]) || { boxes: 0, crates: 0, stretchWrap: 0, bubbleWrap: 0, packingPaper: 0 },
    access: (jobRow.access as Job["access"]) || { parking: "easy", narrowPassage: false, narrowNote: "", entryDistance: "short" },
  }

  const calc = calculateJob(jobForCalc)
  const token = nanoid(12)

  // 14-day validity
  const validUntil = new Date()
  validUntil.setDate(validUntil.getDate() + 14)

  const [offer] = await db
    .insert(schema.offers)
    .values({
      jobId,
      token,
      totalVolume: String(calc.totalVolume),
      truckCount: calc.truckCount,
      workerCount: calc.workerCount,
      estimatedHours: String(calc.estimatedHours),
      totalPrice: String(customPrice ?? calc.totalPrice),
      breakdown: calc.breakdown,
      materials: calc.materials,
      status: "sent",
      validUntil,
    })
    .returning({ id: schema.offers.id, token: schema.offers.token })

  // Update job status
  await db
    .update(schema.jobs)
    .set({ status: "offer", updatedAt: new Date() })
    .where(eq(schema.jobs.id, jobId))

  const finalPrice = customPrice ?? calc.totalPrice

  await logJobEvent(jobId, "offer_generated", {
    offerId: offer.id,
    token: offer.token,
    calculatedPrice: calc.totalPrice,
    finalPrice,
    customPrice: customPrice !== null ? customPrice : undefined,
  })

  return Response.json({
    id: offer.id,
    token: offer.token,
    url: `/offer/${offer.token}`,
    totalPrice: finalPrice,
  }, { status: 201 })
}

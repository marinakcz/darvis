import { db, schema } from "@/lib/db"
import { logJobEvent } from "@/lib/db/events"
import { eq } from "drizzle-orm"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

/** PUT /api/jobs/[id]/survey — save survey data (rooms + items + job fields) */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: jobId } = await params
  const body = await request.json()

  // Verify job exists
  const [job] = await db
    .select({ id: schema.jobs.id })
    .from(schema.jobs)
    .where(eq(schema.jobs.id, jobId))
    .limit(1)

  if (!job) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  // Update job fields
  await db
    .update(schema.jobs)
    .set({
      jobType: body.jobType,
      vehicleId: body.vehicleId,
      pickupAddress: body.pickup?.address,
      pickupFloor: body.pickup?.floor,
      pickupElevator: body.pickup?.elevator,
      deliveryAddress: body.delivery?.address,
      deliveryFloor: body.delivery?.floor,
      deliveryElevator: body.delivery?.elevator,
      distance: body.distance != null ? String(body.distance) : undefined,
      access: body.access,
      date: body.date,
      materials: body.materials,
      technicianNotes: body.technicianNotes,
      status: body.status || "survey",
      updatedAt: new Date(),
    })
    .where(eq(schema.jobs.id, jobId))

  // Replace rooms: delete old, insert new
  // First delete old items (cascade via FK), then rooms
  const oldRooms = await db
    .select({ id: schema.jobRooms.id })
    .from(schema.jobRooms)
    .where(eq(schema.jobRooms.jobId, jobId))

  for (const room of oldRooms) {
    await db.delete(schema.jobItems).where(eq(schema.jobItems.roomId, room.id))
  }
  await db.delete(schema.jobRooms).where(eq(schema.jobRooms.jobId, jobId))

  // Insert new rooms + items
  if (Array.isArray(body.surveyRooms)) {
    for (let i = 0; i < body.surveyRooms.length; i++) {
      const sr = body.surveyRooms[i]
      const [room] = await db
        .insert(schema.jobRooms)
        .values({
          jobId,
          type: sr.type,
          customName: sr.customName || null,
          mode: sr.mode || "quick",
          percent: sr.percent ?? 0,
          sortOrder: i,
        })
        .returning({ id: schema.jobRooms.id })

      if (Array.isArray(sr.items) && sr.items.length > 0) {
        await db.insert(schema.jobItems).values(
          sr.items.map((item: { catalogId: string; quantity: number; services?: { disassembly?: boolean; packing?: boolean; assembly?: boolean }; notes?: string }) => ({
            roomId: room.id,
            catalogId: item.catalogId,
            quantity: item.quantity || 1,
            disassembly: item.services?.disassembly ?? false,
            packing: item.services?.packing ?? false,
            assembly: item.services?.assembly ?? false,
            notes: item.notes || null,
          })),
        )
      }
    }
  }

  await logJobEvent(jobId, "survey_saved", {
    roomCount: body.surveyRooms?.length ?? 0,
  })

  return Response.json({ ok: true })
}

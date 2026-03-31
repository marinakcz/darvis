import { db, schema } from "@/lib/db"
import { logJobEvent } from "@/lib/db/events"
import { eq } from "drizzle-orm"

export const dynamic = "force-dynamic"

/** PATCH /api/offers/[token] — client accepts/rejects offer */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params
  const body = await request.json()
  const { response } = body as { response: "accepted" | "rejected" }

  if (response !== "accepted" && response !== "rejected") {
    return Response.json({ error: "Invalid response" }, { status: 400 })
  }

  const [offer] = await db
    .select()
    .from(schema.offers)
    .where(eq(schema.offers.token, token))
    .limit(1)

  if (!offer) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  // Update offer status
  const offerStatus = response === "accepted" ? "accepted" : "rejected"
  await db
    .update(schema.offers)
    .set({ status: offerStatus })
    .where(eq(schema.offers.id, offer.id))

  // Update job status if accepted
  if (response === "accepted") {
    await db
      .update(schema.jobs)
      .set({ status: "approved", updatedAt: new Date() })
      .where(eq(schema.jobs.id, offer.jobId))
    await logJobEvent(offer.jobId, "status_changed", { from: "offer", to: "approved", source: "client" })
  }

  await logJobEvent(offer.jobId, response === "accepted" ? "offer_accepted" : "offer_rejected", { token })

  return Response.json({ ok: true })
}

/** GET /api/offers/[token] — public offer data (no auth needed) */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params

  const [offer] = await db
    .select()
    .from(schema.offers)
    .where(eq(schema.offers.token, token))
    .limit(1)

  if (!offer) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  // Load job for route details
  const [job] = await db
    .select()
    .from(schema.jobs)
    .where(eq(schema.jobs.id, offer.jobId))
    .limit(1)

  // Load customer
  let customer = null
  if (job?.customerId) {
    const [c] = await db
      .select()
      .from(schema.customers)
      .where(eq(schema.customers.id, job.customerId))
      .limit(1)
    customer = c || null
  }

  // Load rooms for display
  const rooms = await db
    .select()
    .from(schema.jobRooms)
    .where(eq(schema.jobRooms.jobId, offer.jobId))
    .orderBy(schema.jobRooms.sortOrder)

  // Mark as viewed (first view)
  if (!offer.viewedAt) {
    await db
      .update(schema.offers)
      .set({ viewedAt: new Date() })
      .where(eq(schema.offers.id, offer.id))

    await logJobEvent(offer.jobId, "offer_viewed", { token })
  }

  return Response.json({
    token: offer.token,
    totalVolume: Number(offer.totalVolume),
    truckCount: offer.truckCount,
    workerCount: offer.workerCount,
    estimatedHours: Number(offer.estimatedHours),
    totalPrice: Number(offer.totalPrice),
    breakdown: offer.breakdown,
    materials: offer.materials,
    clientNote: offer.clientNote,
    status: offer.status,
    validUntil: offer.validUntil,
    createdAt: offer.createdAt,
    job: job
      ? {
          pickupAddress: job.pickupAddress,
          pickupFloor: job.pickupFloor,
          pickupElevator: job.pickupElevator,
          deliveryAddress: job.deliveryAddress,
          deliveryFloor: job.deliveryFloor,
          deliveryElevator: job.deliveryElevator,
          distance: Number(job.distance),
          date: job.date,
        }
      : null,
    customer: customer
      ? { name: customer.name, phone: customer.phone, email: customer.email }
      : null,
    rooms: rooms.map((r) => ({
      type: r.type,
      customName: r.customName,
      mode: r.mode,
      percent: r.percent,
    })),
  })
}

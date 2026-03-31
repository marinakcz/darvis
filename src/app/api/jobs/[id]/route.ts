import { db, schema } from "@/lib/db"
import { eq } from "drizzle-orm"
import { logJobEvent } from "@/lib/db/events"
import { canTransition, type JobStatus } from "@/lib/job-status"

export const dynamic = "force-dynamic"

/** GET /api/jobs/[id] — full job detail with rooms, items, customer */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  // Job + customer
  const [row] = await db
    .select()
    .from(schema.jobs)
    .where(eq(schema.jobs.id, id))
    .limit(1)

  if (!row) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  // Customer
  let customer = null
  if (row.customerId) {
    const [c] = await db
      .select()
      .from(schema.customers)
      .where(eq(schema.customers.id, row.customerId))
      .limit(1)
    customer = c || null
  }

  // Rooms + items
  const rooms = await db
    .select()
    .from(schema.jobRooms)
    .where(eq(schema.jobRooms.jobId, id))
    .orderBy(schema.jobRooms.sortOrder)

  const roomsWithItems = await Promise.all(
    rooms.map(async (room) => {
      const items = await db
        .select()
        .from(schema.jobItems)
        .where(eq(schema.jobItems.roomId, room.id))
      return { ...room, items }
    }),
  )

  return Response.json({
    ...row,
    customer,
    rooms: roomsWithItems,
  })
}

/** PATCH /api/jobs/[id] — update job fields (notes, access, etc.) */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await request.json()

  // Whitelist updatable fields
  const allowed: Record<string, unknown> = {}
  if ("technicianNotes" in body) allowed.technicianNotes = body.technicianNotes
  if ("dispatcherNote" in body) allowed.dispatcherNote = body.dispatcherNote
  if ("access" in body) allowed.access = body.access
  if ("tags" in body) allowed.tags = body.tags
  if ("lossReason" in body) allowed.lossReason = body.lossReason
  if ("lossNote" in body) allowed.lossNote = body.lossNote
  if ("winReason" in body) allowed.winReason = body.winReason
  if ("winNote" in body) allowed.winNote = body.winNote

  // Status change with transition validation
  if ("status" in body) {
    const [current] = await db
      .select({ status: schema.jobs.status })
      .from(schema.jobs)
      .where(eq(schema.jobs.id, id))
      .limit(1)

    if (!current) {
      return Response.json({ error: "Not found" }, { status: 404 })
    }

    const from = current.status as JobStatus
    const to = body.status as JobStatus

    if (!canTransition(from, to)) {
      return Response.json(
        { error: `Cannot transition from "${from}" to "${to}"` },
        { status: 400 },
      )
    }

    allowed.status = to
    await logJobEvent(id, "status_changed", { from, to })
  }

  if (Object.keys(allowed).length === 0) {
    return Response.json({ error: "No valid fields" }, { status: 400 })
  }

  allowed.updatedAt = new Date()

  await db.update(schema.jobs).set(allowed).where(eq(schema.jobs.id, id))

  if (!("status" in body)) {
    await logJobEvent(id, "job_updated", { fields: Object.keys(allowed) })
  }

  return Response.json({ ok: true })
}

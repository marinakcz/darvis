import { db, schema } from "@/lib/db"
import { eq } from "drizzle-orm"

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

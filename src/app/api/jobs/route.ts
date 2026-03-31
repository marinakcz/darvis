import { db, schema } from "@/lib/db"
import { logJobEvent } from "@/lib/db/events"
import { eq, desc } from "drizzle-orm"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

/** GET /api/jobs — list all jobs (with customer data) */
export async function GET() {
  const rows = await db
    .select({
      id: schema.jobs.id,
      jobType: schema.jobs.jobType,
      status: schema.jobs.status,
      date: schema.jobs.date,
      time: schema.jobs.time,
      pickupAddress: schema.jobs.pickupAddress,
      deliveryAddress: schema.jobs.deliveryAddress,
      pickupFloor: schema.jobs.pickupFloor,
      pickupElevator: schema.jobs.pickupElevator,
      deliveryFloor: schema.jobs.deliveryFloor,
      deliveryElevator: schema.jobs.deliveryElevator,
      distance: schema.jobs.distance,
      dispatcherNote: schema.jobs.dispatcherNote,
      tags: schema.jobs.tags,
      createdAt: schema.jobs.createdAt,
      updatedAt: schema.jobs.updatedAt,
      customerName: schema.customers.name,
      customerPhone: schema.customers.phone,
      customerEmail: schema.customers.email,
    })
    .from(schema.jobs)
    .leftJoin(schema.customers, eq(schema.jobs.customerId, schema.customers.id))
    .orderBy(desc(schema.jobs.createdAt))

  return Response.json(rows)
}

/** POST /api/jobs — create a new job + customer */
export async function POST(request: NextRequest) {
  const body = await request.json()

  // Upsert customer (by phone)
  let customerId: string | null = null
  if (body.client?.name && body.client?.phone) {
    const existing = await db
      .select({ id: schema.customers.id })
      .from(schema.customers)
      .where(eq(schema.customers.phone, body.client.phone))
      .limit(1)

    if (existing.length > 0) {
      customerId = existing[0].id
    } else {
      const [created] = await db
        .insert(schema.customers)
        .values({
          name: body.client.name,
          phone: body.client.phone,
          email: body.client.email || null,
        })
        .returning({ id: schema.customers.id })
      customerId = created.id
    }
  }

  const [job] = await db
    .insert(schema.jobs)
    .values({
      customerId,
      jobType: body.jobType || "apartment",
      vehicleId: body.vehicleId || "medium-24",
      pickupAddress: body.pickup?.address || "",
      pickupFloor: body.pickup?.floor ?? 0,
      pickupElevator: body.pickup?.elevator ?? false,
      deliveryAddress: body.delivery?.address || "",
      deliveryFloor: body.delivery?.floor ?? 0,
      deliveryElevator: body.delivery?.elevator ?? false,
      distance: String(body.distance ?? 0),
      access: body.access || null,
      date: body.date || null,
      time: body.time || null,
      materials: body.materials || null,
      technicianNotes: body.technicianNotes || null,
      dispatcherNote: body.dispatcherNote || null,
      status: "draft",
      fromCRM: body.fromCRM ?? false,
    })
    .returning({ id: schema.jobs.id })

  await logJobEvent(job.id, "job_created", { source: "api" })

  return Response.json({ id: job.id }, { status: 201 })
}

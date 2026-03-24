import { db, schema } from "@/lib/db"
import { ilike, or, sql } from "drizzle-orm"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

/** GET /api/customers/search?q=dvo — search customers by name or phone */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim()
  if (!q || q.length < 2) {
    return Response.json([])
  }

  const pattern = `%${q}%`
  const rows = await db
    .select({
      id: schema.customers.id,
      name: schema.customers.name,
      phone: schema.customers.phone,
      email: schema.customers.email,
      jobCount: sql<number>`(SELECT count(*) FROM jobs WHERE jobs.customer_id = ${schema.customers.id})`.as("job_count"),
    })
    .from(schema.customers)
    .where(or(ilike(schema.customers.name, pattern), ilike(schema.customers.phone, pattern)))
    .limit(10)

  return Response.json(rows)
}

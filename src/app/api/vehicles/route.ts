import { db, schema } from "@/lib/db"
import { eq, asc } from "drizzle-orm"

export const dynamic = "force-dynamic"

/** GET /api/vehicles — seznam aktivních vozidel */
export async function GET() {
  const rows = await db
    .select()
    .from(schema.vehicles)
    .where(eq(schema.vehicles.isActive, true))
    .orderBy(asc(schema.vehicles.sortOrder))

  return Response.json(rows)
}

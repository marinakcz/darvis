import { neon } from "@neondatabase/serverless"

async function main() {
  const sql = neon(process.env.DATABASE_URL!)
  await sql`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS time VARCHAR(5)`
  console.log("Added time column")

  await sql`UPDATE jobs SET time = '09:00' WHERE pickup_address LIKE '%Křižíkova%'`
  await sql`UPDATE jobs SET time = '14:00' WHERE pickup_address LIKE '%Husitská%'`
  await sql`UPDATE jobs SET time = '10:30' WHERE pickup_address LIKE '%Stroupežnického%'`
  await sql`UPDATE jobs SET time = '11:00' WHERE pickup_address LIKE '%Korunní%'`
  console.log("Seeded times")
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })

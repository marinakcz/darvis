/**
 * Seed script: naplní vehicles tabulku z aktuálních konstant.
 * Spuštění: npx tsx src/lib/db/seed-vehicles.ts
 */
import { db } from "."
import { vehicles, settings } from "./schema"

const SEED_VEHICLES = [
  { id: "small-15", name: "Drobné převozy 15 m³", description: "Malý vůz", capacity: 15, hourlyRate: 1210, timeMultiplier: "1.20", sortOrder: 0 },
  { id: "small-20", name: "Malá stěhování 20 m³", description: "Malý vůz", capacity: 20, hourlyRate: 1331, timeMultiplier: "1.20", sortOrder: 1 },
  { id: "medium-24", name: "Malý byt 24 m³", description: "Střední vůz", capacity: 24, hourlyRate: 1815, timeMultiplier: "1.30", sortOrder: 2 },
  { id: "large-33", name: "Běžný byt 33 m³", description: "Větší vůz", capacity: 33, hourlyRate: 2057, timeMultiplier: "1.35", sortOrder: 3 },
  { id: "xlarge-36", name: "Větší domácnosti 36 m³", description: "Největší vůz", capacity: 36, hourlyRate: 2541, timeMultiplier: "1.40", sortOrder: 4 },
]

async function seed() {
  console.log("Seeding vehicles...")

  for (const v of SEED_VEHICLES) {
    await db
      .insert(vehicles)
      .values(v)
      .onConflictDoUpdate({
        target: vehicles.id,
        set: {
          name: v.name,
          description: v.description,
          capacity: v.capacity,
          hourlyRate: v.hourlyRate,
          timeMultiplier: v.timeMultiplier,
          sortOrder: v.sortOrder,
        },
      })
  }

  // Global default time multiplier
  await db
    .insert(settings)
    .values({ key: "default_time_multiplier", value: 1.3 })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: 1.3, updatedAt: new Date() },
    })

  console.log(`✓ ${SEED_VEHICLES.length} vehicles seeded`)
  console.log("✓ default_time_multiplier = 1.3")
  process.exit(0)
}

seed().catch((e) => { console.error(e); process.exit(1) })

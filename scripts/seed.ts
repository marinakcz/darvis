import { db, schema } from "../src/lib/db"

async function seed() {
  // Clear existing data (order matters for FK)
  await db.delete(schema.jobEvents)
  await db.delete(schema.jobItems)
  await db.delete(schema.jobRooms)
  await db.delete(schema.offers)
  await db.delete(schema.jobs)
  await db.delete(schema.customers)

  // Create customers
  const customers = await db
    .insert(schema.customers)
    .values([
      { name: "Petr Dvořák", phone: "+420 777 123 456", email: "dvorak@email.cz" },
      { name: "Anna Kowalski", phone: "+420 608 222 333", email: "kowalski@email.cz" },
      { name: "Marie Svobodová", phone: "+420 731 444 555", email: "svobodova@email.cz" },
      { name: "Tomáš Novák", phone: "+420 602 888 999", email: "novak@email.cz" },
      { name: "Lucie Krejčí", phone: "+420 775 666 777", email: "krejci@email.cz" },
      { name: "Jana Horáková", phone: "+420 720 111 222", email: "horakova@email.cz" },
    ])
    .returning()

  const today = new Date().toISOString().split("T")[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]
  const dayAfter = new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0]
  const nextWeek = new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0]

  const jobs = await db
    .insert(schema.jobs)
    .values([
      {
        customerId: customers[0].id,
        jobType: "apartment",
        vehicleId: "large-30",
        pickupAddress: "Křižíkova 42, Praha 8 — Karlín",
        pickupFloor: 3,
        pickupElevator: false,
        deliveryAddress: "Levského 3112, Praha 4 — Modřany",
        deliveryFloor: 1,
        deliveryElevator: true,
        distance: "14",
        date: today,
        status: "survey",
        dispatcherNote: "Klient preferuje dopolední termín. Pozor na úzké schodiště ve 2. patře.",
        access: { parking: "limited", narrowPassage: true, narrowNote: "Úzké schodiště 80 cm", entryDistance: "medium" },
      },
      {
        customerId: customers[1].id,
        jobType: "apartment",
        vehicleId: "xlarge-36",
        pickupAddress: "Stroupežnického 18, Praha 5 — Smíchov",
        pickupFloor: 2,
        pickupElevator: true,
        deliveryAddress: "Jugoslávských partyzánů 3, Praha 6 — Dejvice",
        deliveryFloor: 4,
        deliveryElevator: true,
        distance: "8",
        date: nextWeek,
        status: "survey",
        dispatcherNote: "Klientka má velký klavír — nutné speciální balení.",
        access: { parking: "easy", narrowPassage: false, narrowNote: "", entryDistance: "short" },
      },
      {
        customerId: customers[2].id,
        jobType: "apartment",
        vehicleId: "medium-24",
        pickupAddress: "Korunní 88, Praha 2 — Vinohrady",
        pickupFloor: 1,
        pickupElevator: false,
        deliveryAddress: "Tupolevova 710, Praha 9 — Letňany",
        deliveryFloor: 0,
        deliveryElevator: false,
        distance: "18",
        date: tomorrow,
        status: "offer",
        access: { parking: "easy", narrowPassage: false, narrowNote: "", entryDistance: "short" },
      },
      {
        customerId: customers[3].id,
        jobType: "apartment",
        vehicleId: "large-30",
        pickupAddress: "Husitská 12, Praha 3 — Žižkov",
        pickupFloor: 4,
        pickupElevator: true,
        deliveryAddress: "Hornoměcholupská 55, Praha 10 — Hostivař",
        deliveryFloor: 2,
        deliveryElevator: false,
        distance: "11",
        date: today,
        status: "execution",
        access: { parking: "difficult", narrowPassage: false, narrowNote: "", entryDistance: "long" },
      },
      {
        customerId: customers[4].id,
        jobType: "apartment",
        vehicleId: "medium-24",
        pickupAddress: "Bělohorská 90, Praha 6 — Břevnov",
        pickupFloor: 2,
        pickupElevator: false,
        deliveryAddress: "Ke Kaménce 4, Praha 5 — Barrandov",
        deliveryFloor: 3,
        deliveryElevator: true,
        distance: "9",
        date: dayAfter,
        status: "draft",
        access: { parking: "easy", narrowPassage: false, narrowNote: "", entryDistance: "short" },
      },
      {
        customerId: customers[5].id,
        jobType: "apartment",
        vehicleId: "small-18",
        pickupAddress: "Táborská 30, Praha 4 — Nusle",
        pickupFloor: 0,
        pickupElevator: false,
        deliveryAddress: "Kodaňská 12, Praha 10 — Vršovice",
        deliveryFloor: 1,
        deliveryElevator: false,
        distance: "5",
        date: null,
        status: "invoicing",
        access: { parking: "easy", narrowPassage: false, narrowNote: "", entryDistance: "short" },
      },
    ])
    .returning()

  // Rooms + items for Dvořák (survey job)
  const rooms = await db
    .insert(schema.jobRooms)
    .values([
      { jobId: jobs[0].id, type: "living", mode: "quick", percent: 70, sortOrder: 0 },
      { jobId: jobs[0].id, type: "bedroom", mode: "quick", percent: 50, sortOrder: 1 },
      { jobId: jobs[0].id, type: "kitchen", mode: "quick", percent: 40, sortOrder: 2 },
    ])
    .returning()

  await db.insert(schema.jobItems).values([
    { roomId: rooms[0].id, catalogId: "sofa-3seat", quantity: 1, disassembly: false, packing: true, assembly: false },
    { roomId: rooms[0].id, catalogId: "tv-large", quantity: 1, disassembly: false, packing: true, assembly: false },
    { roomId: rooms[0].id, catalogId: "bookshelf-large", quantity: 2, disassembly: true, packing: false, assembly: true },
    { roomId: rooms[1].id, catalogId: "bed-double", quantity: 1, disassembly: true, packing: false, assembly: true },
    { roomId: rooms[1].id, catalogId: "wardrobe-large", quantity: 1, disassembly: true, packing: false, assembly: true },
    { roomId: rooms[2].id, catalogId: "fridge", quantity: 1, disassembly: false, packing: false, assembly: false },
    { roomId: rooms[2].id, catalogId: "washing-machine", quantity: 1, disassembly: false, packing: false, assembly: false },
  ])

  // Event log
  for (const job of jobs) {
    await db.insert(schema.jobEvents).values({
      jobId: job.id,
      type: "job_created",
      payload: { source: "seed" },
    })
  }

  console.log(`Seeded: ${customers.length} customers, ${jobs.length} jobs, ${rooms.length} rooms, 7 items`)
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

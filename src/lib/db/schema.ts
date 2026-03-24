import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  boolean,
  numeric,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core"

/* ── Customers ── */

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

/* ── Jobs (zakázky) ── */

export const jobs = pgTable("jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id").references(() => customers.id),

  // Typ a mód
  jobType: varchar("job_type", { length: 50 }).notNull().default("apartment"),
  vehicleId: varchar("vehicle_id", { length: 50 }).notNull().default("medium-24"),

  // Lokace
  pickupAddress: text("pickup_address").notNull().default(""),
  pickupFloor: integer("pickup_floor").notNull().default(0),
  pickupElevator: boolean("pickup_elevator").notNull().default(false),
  deliveryAddress: text("delivery_address").notNull().default(""),
  deliveryFloor: integer("delivery_floor").notNull().default(0),
  deliveryElevator: boolean("delivery_elevator").notNull().default(false),
  distance: numeric("distance", { precision: 10, scale: 2 }).notNull().default("0"),

  // Přístup a rizika
  access: jsonb("access").$type<{
    parking: "easy" | "limited" | "difficult"
    narrowPassage: boolean
    narrowNote: string
    entryDistance: "short" | "medium" | "long"
  }>(),

  // Čas
  date: varchar("date", { length: 20 }),
  time: varchar("time", { length: 5 }), // "09:00", "14:30", null

  // Materiály (user override)
  materials: jsonb("materials").$type<{
    boxes: number
    crates: number
    stretchWrap: number
    bubbleWrap: number
    packingPaper: number
  }>(),

  // Poznámky
  technicianNotes: text("technician_notes"),
  dispatcherNote: text("dispatcher_note"),

  // Stav zakázky (Blok 2 rozšíří)
  status: varchar("status", { length: 50 }).notNull().default("draft"),

  // CRM
  fromCRM: boolean("from_crm").notNull().default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

/* ── Survey Rooms (místnosti zaměření) ── */

export const jobRooms = pgTable("job_rooms", {
  id: uuid("id").defaultRandom().primaryKey(),
  jobId: uuid("job_id").references(() => jobs.id, { onDelete: "cascade" }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // RoomType
  customName: varchar("custom_name", { length: 255 }),
  mode: varchar("mode", { length: 20 }).notNull().default("quick"), // "quick" | "detailed"
  percent: integer("percent").notNull().default(0), // quick mód: % zaplnění
  sortOrder: integer("sort_order").notNull().default(0),
})

/* ── Job Items (položky v místnosti) ── */

export const jobItems = pgTable("job_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  roomId: uuid("room_id").references(() => jobRooms.id, { onDelete: "cascade" }).notNull(),
  catalogId: varchar("catalog_id", { length: 100 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  disassembly: boolean("disassembly").notNull().default(false),
  packing: boolean("packing").notNull().default(false),
  assembly: boolean("assembly").notNull().default(false),
  notes: text("notes"),
})

/* ── Offers (nabídky) ── */

export const offers = pgTable("offers", {
  id: uuid("id").defaultRandom().primaryKey(),
  jobId: uuid("job_id").references(() => jobs.id, { onDelete: "cascade" }).notNull(),
  token: varchar("token", { length: 50 }).notNull().unique(),

  // Kalkulace snapshot
  totalVolume: numeric("total_volume", { precision: 10, scale: 2 }).notNull(),
  truckCount: integer("truck_count").notNull(),
  workerCount: integer("worker_count").notNull(),
  estimatedHours: numeric("estimated_hours", { precision: 10, scale: 2 }).notNull(),
  totalPrice: numeric("total_price", { precision: 12, scale: 2 }).notNull(),
  breakdown: jsonb("breakdown").$type<{
    trucks: number
    labor: number
    materials: number
    floorSurcharge: number
    distanceSurcharge: number
  }>().notNull(),
  materials: jsonb("materials").$type<{
    boxes: number
    crates: number
    stretchWrap: number
    bubbleWrap: number
    packingPaper: number
  }>().notNull(),

  // Stav nabídky
  status: varchar("status", { length: 50 }).notNull().default("sent"),
  validUntil: timestamp("valid_until"),
  viewedAt: timestamp("viewed_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
})

/* ── Job Events (audit log) ── */

export const jobEvents = pgTable("job_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  jobId: uuid("job_id").references(() => jobs.id, { onDelete: "cascade" }).notNull(),
  type: varchar("type", { length: 100 }).notNull(), // "job_created", "survey_saved", "offer_generated", ...
  payload: jsonb("payload").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

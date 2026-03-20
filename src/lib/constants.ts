// Ceníkové konstanty – Stěhování Praha
// Zdroj: stehovanipraha.cz/stehovaci-sluzby/stehovani-bytu-domu
// Všechny ceny v Kč

/** @deprecated Použij VEHICLES[].capacity */
export const TRUCK_CAPACITY = 20

/** @deprecated Použij VEHICLES[].rate */
export const TRUCK_RATE = 3500

/** Vozový park s hodinovými sazbami */
export const VEHICLES = [
  { id: "small-15", name: "Drobné převozy 15 m³", capacity: 15, hourlyRate: 1210, description: "Malý vůz" },
  { id: "small-20", name: "Malá stěhování 20 m³", capacity: 20, hourlyRate: 1331, description: "Malý vůz" },
  { id: "medium-24", name: "Malý byt 24 m³", capacity: 24, hourlyRate: 1815, description: "Střední vůz" },
  { id: "large-33", name: "Běžný byt 33 m³", capacity: 33, hourlyRate: 2057, description: "Větší vůz" },
  { id: "xlarge-36", name: "Větší domácnosti 36 m³", capacity: 36, hourlyRate: 2541, description: "Největší vůz" },
] as const

export type VehicleId = typeof VEHICLES[number]["id"]

/** Hodinová sazba za jednoho pracovníka */
export const WORKER_HOURLY_RATE = 450

/** Základní počet pracovníků na jedno auto */
export const BASE_WORKERS_PER_TRUCK = 2

/** Základní čas nakládky/vykládky za m³ (v hodinách) */
export const HOURS_PER_CUBIC_METER = 0.15

/** Čas za 1 km jízdy (v hodinách) */
export const HOURS_PER_KM = 0.02

/** Příplatek za patro bez výtahu – počet minut na patro */
export const FLOOR_MINUTES_PER_FLOOR = 15

/** Materiály */
export const MATERIAL_RATES = {
  /** Cena za jednu stěhovací krabici */
  box: 80,
  /** Cena za roli stretch fólie */
  wrap: 120,
  /** Cena za roli lepicí pásky */
  tape: 35,
} as const

/** Počet krabic na m³ nákladu (odhad) */
export const BOXES_PER_CUBIC_METER = 2

/** Počet rolí fólie na auto */
export const WRAP_ROLLS_PER_TRUCK = 2

/** Počet rolí pásky na auto */
export const TAPE_ROLLS_PER_TRUCK = 3

/** Příplatek za demontáž/montáž jedné položky */
export const SERVICE_RATE_DISASSEMBLY = 300

/** Příplatek za balení jedné položky */
export const SERVICE_RATE_PACKING = 150

/** Příplatek za montáž jedné položky */
export const SERVICE_RATE_ASSEMBLY = 300

/** Minimální cena zakázky */
export const MIN_PRICE = 3000

/** Centrála — výchozí bod trasy */
export const DEPOT = {
  address: "U Pekařky 484/1a, Praha 8",
  lat: 50.1087,
  lng: 14.4477,
} as const

/** Pojištění */
export const INSURANCE_LIMIT = 20_000_000 // Kč, standardní pojištění

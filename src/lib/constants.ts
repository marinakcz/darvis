// Ceníkové konstanty – Stěhování Praha
// Všechny ceny v Kč

/** Kapacita jednoho stěhovacího vozu v m³ */
export const TRUCK_CAPACITY = 20

/** Cena za jedno auto (výjezd + amortizace) */
export const TRUCK_RATE = 3500

/** Hodinová sazba za jednoho pracovníka */
export const WORKER_HOURLY_RATE = 450

/** Základní počet pracovníků na jedno auto */
export const BASE_WORKERS_PER_TRUCK = 2

/** Základní čas nakládky/vykládky za m³ (v hodinách) */
export const HOURS_PER_CUBIC_METER = 0.15

/** Čas za 1 km jízdy (v hodinách) – zahrnuje nakládku/vykládku i jízdu */
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

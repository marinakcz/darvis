export type SurveyMode = "quick" | "detailed"

export type JobType = "apartment" | "office" | "heavy" | "art" | "international"

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  apartment: "Byt / Dům",
  office: "Kancelář / Firma",
  heavy: "Těžké břemeno",
  art: "Umělecké předměty",
  international: "Mezinárodní",
}

export type VehicleId = "small-15" | "small-20" | "medium-24" | "large-33" | "xlarge-36"

export type RoomType =
  | "bedroom"
  | "living"
  | "kitchen"
  | "bathroom"
  | "hallway"
  | "basement"
  | "kids"
  | "office"
  | "other"

export const ROOM_LABELS: Record<RoomType, string> = {
  bedroom: "Ložnice",
  living: "Obývací pokoj",
  kitchen: "Kuchyň",
  bathroom: "Koupelna",
  hallway: "Chodba / Předsíň",
  basement: "Sklep / Garáž",
  kids: "Dětský pokoj",
  office: "Pracovna",
  other: "Ostatní",
}


export interface Job {
  mode: SurveyMode
  jobType: JobType
  vehicleId: VehicleId
  client: { name: string; phone: string; email: string }
  pickup: { address: string; floor: number; elevator: boolean }
  delivery: { address: string; floor: number; elevator: boolean }
  distance: number
  date: string
  rooms: Room[]
  /** Martin mód — % odhad za místnost */
  quickRooms: QuickRoom[]
  /** Materiálový požadavek */
  materials: MaterialOrder
}

export interface Room {
  id: string
  type: RoomType
  customName?: string
  items: InventoryItem[]
}

/** Martin mód — místnost s % zaplnění */
export interface QuickRoom {
  id: string
  type: RoomType
  percent: number // 0–100, procento z jednoho auta (24m³)
}

export interface InventoryItem {
  id: string
  catalogId: string
  quantity: number
  services: { disassembly: boolean; packing: boolean; assembly: boolean }
  notes?: string
}

export interface CatalogItem {
  id: string
  name: string
  category: ItemCategory
  volume: number // m³
  defaultServices: { disassembly: boolean; packing: boolean; assembly: boolean }
  requires?: string[]
  suggests?: string[]
}

export type ItemCategory = "furniture" | "electronics" | "fragile" | "other"

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  furniture: "Nábytek",
  electronics: "Elektronika",
  fragile: "Křehké",
  other: "Ostatní",
}


/** Obalové materiály */
export interface MaterialOrder {
  boxes: number        // krabice stěhovací
  crates: number       // přepravky
  stretchWrap: number  // stretch fólie (role)
  bubbleWrap: number   // bublinková fólie (role)
  packingPaper: number // balící papír (role)
}

export const MATERIAL_LABELS: Record<keyof MaterialOrder, string> = {
  boxes: "Krabice",
  crates: "Přepravky",
  stretchWrap: "Stretch fólie",
  bubbleWrap: "Bublinková fólie",
  packingPaper: "Balící papír",
}

export const MATERIAL_UNITS: Record<keyof MaterialOrder, string> = {
  boxes: "ks",
  crates: "ks",
  stretchWrap: "rolí",
  bubbleWrap: "rolí",
  packingPaper: "rolí",
}

export interface Calculation {
  totalVolume: number
  truckCount: number
  workerCount: number
  estimatedHours: number
  materials: MaterialOrder
  breakdown: {
    trucks: number
    labor: number
    materials: number
    floorSurcharge: number
    distanceSurcharge: number
  }
  totalPrice: number
}

export function createEmptyJob(mode: SurveyMode = "detailed"): Job {
  return {
    mode,
    jobType: "apartment",
    vehicleId: "medium-24",
    client: { name: "", phone: "", email: "" },
    pickup: { address: "", floor: 0, elevator: false },
    delivery: { address: "", floor: 0, elevator: false },
    distance: 0,
    date: "",
    rooms: [],
    quickRooms: [],
    materials: {
      boxes: 0,
      crates: 0,
      stretchWrap: 0,
      bubbleWrap: 0,
      packingPaper: 0,
    },
  }
}

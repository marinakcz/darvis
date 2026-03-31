import type { Job, Calculation, MaterialOrder } from "./types"
import { getCatalogItem } from "./catalog"
import {
  VEHICLES,
  WORKER_HOURLY_RATE,
  BASE_WORKERS_PER_TRUCK,
  HOURS_PER_CUBIC_METER,
  HOURS_PER_KM,
  FLOOR_MINUTES_PER_FLOOR,
  MATERIAL_RATES,
  BOXES_PER_CUBIC_METER,
  WRAP_ROLLS_PER_TRUCK,
  SERVICE_RATE_DISASSEMBLY,
  SERVICE_RATE_PACKING,
  SERVICE_RATE_ASSEMBLY,
  MIN_PRICE,
} from "./constants"

/** Vehicle data that can come from DB or constants */
export interface VehicleData {
  id: string
  capacity: number
  hourlyRate: number
  timeMultiplier?: number
}

export function calculateJob(job: Job, vehicleOverride?: VehicleData): Calculation {
  // Resolve selected vehicle: DB override → constants fallback
  const vehicle = vehicleOverride
    ?? VEHICLES.find((v) => v.id === job.vehicleId)
    ?? VEHICLES[2]
  const vehicleCapacity = vehicle.capacity
  const vehicleHourlyRate = vehicle.hourlyRate
  const timeMultiplier = vehicleOverride?.timeMultiplier ?? 1.0

  let totalVolume: number
  let servicesCost = 0

  // New unified surveyRooms path (Blok 1)
  if (job.surveyRooms && job.surveyRooms.length > 0) {
    totalVolume = 0
    for (const room of job.surveyRooms) {
      if (room.mode === "quick") {
        totalVolume += (room.percent / 100) * vehicleCapacity
      } else {
        for (const item of room.items) {
          const catalog = getCatalogItem(item.catalogId)
          if (!catalog) continue
          totalVolume += catalog.volume * item.quantity
          if (item.services.disassembly) servicesCost += SERVICE_RATE_DISASSEMBLY * item.quantity
          if (item.services.packing) servicesCost += SERVICE_RATE_PACKING * item.quantity
          if (item.services.assembly) servicesCost += SERVICE_RATE_ASSEMBLY * item.quantity
        }
      }
    }
  } else if (job.mode === "quick") {
    // Legacy: Martin mód — % odhad
    const totalPercent = job.quickRooms.reduce((sum, r) => sum + r.percent, 0)
    totalVolume = (totalPercent / 100) * vehicleCapacity
  } else {
    // Legacy: Richard mód — katalogové položky
    totalVolume = 0
    for (const room of job.rooms) {
      for (const item of room.items) {
        const catalog = getCatalogItem(item.catalogId)
        if (!catalog) continue
        totalVolume += catalog.volume * item.quantity
        if (item.services.disassembly) servicesCost += SERVICE_RATE_DISASSEMBLY * item.quantity
        if (item.services.packing) servicesCost += SERVICE_RATE_PACKING * item.quantity
        if (item.services.assembly) servicesCost += SERVICE_RATE_ASSEMBLY * item.quantity
      }
    }
  }

  // Počet aut
  const truckCount = Math.max(1, Math.ceil(totalVolume / vehicleCapacity))

  // Pracovníci
  const workerCount = truckCount * BASE_WORKERS_PER_TRUCK

  // Floor penalty
  const pickupFloorPenalty =
    !job.pickup.elevator && job.pickup.floor > 0
      ? (job.pickup.floor * FLOOR_MINUTES_PER_FLOOR) / 60
      : 0
  const deliveryFloorPenalty =
    !job.delivery.elevator && job.delivery.floor > 0
      ? (job.delivery.floor * FLOOR_MINUTES_PER_FLOOR) / 60
      : 0
  const floorPenaltyHours = pickupFloorPenalty + deliveryFloorPenalty

  // Čas — distanceHours násobeno timeMultiplier (nákladní auto jede pomaleji)
  const baseHours = totalVolume * HOURS_PER_CUBIC_METER
  const distanceHours = job.distance * HOURS_PER_KM * timeMultiplier
  const estimatedHours = Math.max(2, Math.ceil((baseHours + distanceHours + floorPenaltyHours) * 2) / 2)

  // Materiál — buď z uživatelského vstupu, nebo auto-odhad
  const hasUserMaterials = Object.values(job.materials).some((v) => v > 0)
  const materials: MaterialOrder = hasUserMaterials
    ? { ...job.materials }
    : {
        boxes: Math.ceil(totalVolume * BOXES_PER_CUBIC_METER),
        crates: 0,
        stretchWrap: truckCount * WRAP_ROLLS_PER_TRUCK,
        bubbleWrap: Math.ceil(truckCount * 0.5),
        packingPaper: truckCount,
      }

  // Cena — hodinová sazba vozu zahrnuje řidiče, palivo, amortizaci
  const trucksCost = truckCount * estimatedHours * vehicleHourlyRate
  const laborCost = workerCount * estimatedHours * WORKER_HOURLY_RATE
  const materialsCost =
    materials.boxes * MATERIAL_RATES.box +
    materials.crates * MATERIAL_RATES.box * 1.5 +
    materials.stretchWrap * MATERIAL_RATES.wrap +
    materials.bubbleWrap * MATERIAL_RATES.wrap * 1.2 +
    materials.packingPaper * MATERIAL_RATES.tape * 2

  const floorSurcharge = Math.round(floorPenaltyHours * workerCount * WORKER_HOURLY_RATE)
  const distanceSurcharge = job.distance > 30 ? Math.round((job.distance - 30) * 25) : 0

  const rawTotal = trucksCost + laborCost + materialsCost + servicesCost + floorSurcharge + distanceSurcharge
  const totalPrice = Math.max(MIN_PRICE, Math.round(rawTotal / 100) * 100)

  return {
    totalVolume: Math.round(totalVolume * 100) / 100,
    truckCount,
    workerCount,
    estimatedHours,
    materials,
    breakdown: {
      trucks: trucksCost,
      labor: laborCost,
      materials: materialsCost + servicesCost,
      floorSurcharge,
      distanceSurcharge,
    },
    totalPrice,
  }
}

/** Formátování ceny v Kč */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("cs-CZ").format(amount) + " Kč"
}

/** Formátování objemu */
export function formatVolume(volume: number): string {
  return volume.toFixed(1) + " m³"
}

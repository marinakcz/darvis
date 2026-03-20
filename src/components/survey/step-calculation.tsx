"use client"

import type { Job, MaterialOrder, VehicleId } from "@/lib/types"
import { ROOM_LABELS, MATERIAL_LABELS, MATERIAL_UNITS } from "@/lib/types"
import { VEHICLES } from "@/lib/constants"
import { calculateJob, formatPrice, formatVolume } from "@/lib/calculator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Truck } from "lucide-react"

/** Auto-select vehicle based on total volume */
function autoSelectVehicle(totalVolume: number): VehicleId {
  if (totalVolume <= 15) return "small"
  if (totalVolume <= 20) return "medium"
  return "large"
}

interface StepCalculationProps {
  job: Job
  onChange: (updater: (prev: Job) => Job) => void
  onNext: () => void
  onBack: () => void
}

export function StepCalculation({ job, onChange, onNext, onBack }: StepCalculationProps) {
  const calc = calculateJob(job)
  const suggestedVehicle = autoSelectVehicle(calc.totalVolume)

  function selectVehicle(vehicleId: VehicleId) {
    onChange((prev) => ({ ...prev, vehicleId }))
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Vehicle selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Truck className="size-4" />
            Typ vozu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {VEHICLES.map((vehicle) => {
              const isActive = job.vehicleId === vehicle.id
              const isSuggested = suggestedVehicle === vehicle.id
              return (
                <button
                  key={vehicle.id}
                  type="button"
                  onClick={() => selectVehicle(vehicle.id)}
                  className={`flex flex-1 flex-col items-center gap-1 rounded-lg border px-2 py-3 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <span className="text-sm font-medium">{vehicle.name}</span>
                  <span className="text-xs font-mono">{formatPrice(vehicle.rate)}</span>
                  {isSuggested && !isActive && (
                    <span className="text-[10px] text-muted-foreground">doporučeno</span>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Overview */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Objem" value={formatVolume(calc.totalVolume)} />
        <StatCard label="Aut" value={`${calc.truckCount}×`} />
        <StatCard label="Pracovníků" value={`${calc.workerCount}`} />
        <StatCard label="Hodin" value={`${calc.estimatedHours}`} />
      </div>

      {/* Price breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Rozpis ceny</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <PriceLine label="Doprava (auta)" value={calc.breakdown.trucks} />
          <PriceLine label="Práce" value={calc.breakdown.labor} />
          <PriceLine label="Materiál + služby" value={calc.breakdown.materials} />
          {calc.breakdown.floorSurcharge > 0 && (
            <PriceLine label="Příplatek za patra" value={calc.breakdown.floorSurcharge} />
          )}
          {calc.breakdown.distanceSurcharge > 0 && (
            <PriceLine label="Příplatek za vzdálenost" value={calc.breakdown.distanceSurcharge} />
          )}
          <Separator className="my-2" />
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Celkem</span>
            <span className="font-mono text-2xl font-bold">
              {formatPrice(calc.totalPrice)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Materials */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Materiál</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm">
          {(Object.entries(calc.materials) as [keyof MaterialOrder, number][])
            .filter(([, v]) => v > 0)
            .map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-muted-foreground">{MATERIAL_LABELS[key]}</span>
                <span className="font-mono">{value} {MATERIAL_UNITS[key]}</span>
              </div>
            ))}
        </CardContent>
      </Card>

      {/* Items summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Soupis položek</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm">
          {job.mode === "quick"
            ? (job.quickRooms ?? []).map((room) => (
                <div key={room.id} className="flex justify-between">
                  <span className="font-medium">{ROOM_LABELS[room.type]}</span>
                  <span className="font-mono text-muted-foreground">{room.percent}%</span>
                </div>
              ))
            : (job.rooms ?? []).map((room) => (
                <div key={room.id}>
                  <span className="font-medium">
                    {ROOM_LABELS[room.type]}
                    {room.customName ? ` (${room.customName})` : ""}
                  </span>
                  <span className="text-muted-foreground">
                    {" — "}
                    {room.items.length === 0
                      ? "zatím bez položek"
                      : `${room.items.reduce((sum, i) => sum + i.quantity, 0)} pol.`}
                  </span>
                </div>
              ))}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur py-4 -mx-4 px-4 border-t border-border mt-auto">
        <div className="flex gap-3">
          <Button variant="outline" size="lg" className="h-14 flex-1" onClick={onBack}>
            ← Zpět
          </Button>
          <Button size="lg" className="h-14 flex-1 text-base" onClick={onNext}>
            Vygenerovat nabídku →
          </Button>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-1 py-4">
        <span className="font-mono text-2xl font-bold">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  )
}

function PriceLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{formatPrice(value)}</span>
    </div>
  )
}

"use client"

import { useState } from "react"
import type { Job, MaterialOrder, VehicleId } from "@/lib/types"
import { ROOM_LABELS, MATERIAL_LABELS, MATERIAL_UNITS } from "@/lib/types"
import { VEHICLES } from "@/lib/constants"
import { calculateJob, formatPrice, formatVolume } from "@/lib/calculator"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Truck, ChevronDown, ChevronUp } from "lucide-react"

/** Auto-select vehicle based on total volume */
function autoSelectVehicle(totalVolume: number): VehicleId {
  if (totalVolume <= 15) return "small-15"
  if (totalVolume <= 20) return "small-20"
  if (totalVolume <= 24) return "medium-24"
  if (totalVolume <= 33) return "large-33"
  return "xlarge-36"
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
  const [vehicleExpanded, setVehicleExpanded] = useState(false)
  const [priceExpanded, setPriceExpanded] = useState(false)

  const selectedVehicle = VEHICLES.find((v) => v.id === job.vehicleId) ?? VEHICLES[2]

  function selectVehicle(vehicleId: VehicleId) {
    onChange((prev) => ({ ...prev, vehicleId }))
    setVehicleExpanded(false)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Vehicle selector — collapsed: shows selected, click to change */}
      <button
        type="button"
        onClick={() => setVehicleExpanded((prev) => !prev)}
        className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 min-h-[44px] w-full text-left transition-colors hover:bg-accent active:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <div className="flex items-center gap-2">
          <Truck className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">{selectedVehicle.name}</span>
          <span className="text-xs font-mono text-muted-foreground">{formatPrice(selectedVehicle.hourlyRate)}/hod</span>
        </div>
        {vehicleExpanded ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
      </button>

      {vehicleExpanded && (
        <div className="rounded-2xl border border-border bg-muted/30 overflow-hidden divide-y divide-border">
          {VEHICLES.map((vehicle) => {
            const isActive = job.vehicleId === vehicle.id
            const isSuggested = suggestedVehicle === vehicle.id
            return (
              <button
                key={vehicle.id}
                type="button"
                onClick={() => selectVehicle(vehicle.id)}
                className={`flex items-center justify-between px-4 py-2.5 min-h-[44px] w-full text-left transition-colors hover:bg-accent active:bg-accent ${
                  isActive ? "bg-primary/10" : ""
                }`}
              >
                <div className="flex flex-col">
                  <span className={`text-sm font-medium ${isActive ? "text-primary" : ""}`}>
                    {vehicle.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">
                    {formatPrice(vehicle.hourlyRate)}/hod
                  </span>
                  {isSuggested && (
                    <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">
                      tip
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Stats — single compact row */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
        <div className="flex flex-col items-center gap-0.5">
          <span className="font-mono text-base font-bold">{formatVolume(calc.totalVolume)}</span>
          <span className="text-[10px] text-muted-foreground">Objem</span>
        </div>
        <Separator orientation="vertical" className="h-8" />
        <div className="flex flex-col items-center gap-0.5">
          <span className="font-mono text-base font-bold">{calc.truckCount}x</span>
          <span className="text-[10px] text-muted-foreground">Aut</span>
        </div>
        <Separator orientation="vertical" className="h-8" />
        <div className="flex flex-col items-center gap-0.5">
          <span className="font-mono text-base font-bold">{calc.workerCount}</span>
          <span className="text-[10px] text-muted-foreground">Lidi</span>
        </div>
        <Separator orientation="vertical" className="h-8" />
        <div className="flex flex-col items-center gap-0.5">
          <span className="font-mono text-base font-bold">{calc.estimatedHours}h</span>
          <span className="text-[10px] text-muted-foreground">Hodin</span>
        </div>
      </div>

      {/* Price — collapsed: total only, expanded: full breakdown */}
      <button
        type="button"
        onClick={() => setPriceExpanded((prev) => !prev)}
        className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 min-h-[44px] w-full text-left transition-colors hover:bg-accent active:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span className="text-base font-semibold">Celkem</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xl font-bold">{formatPrice(calc.totalPrice)}</span>
          {priceExpanded ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
        </div>
      </button>

      {priceExpanded && (
        <div className="rounded-2xl border border-border bg-muted/30 overflow-hidden divide-y divide-border">
          <PriceRow label="Doprava (auta)" value={calc.breakdown.trucks} />
          <PriceRow label="Prace" value={calc.breakdown.labor} />
          <PriceRow label="Material + sluzby" value={calc.breakdown.materials} />
          {calc.breakdown.floorSurcharge > 0 && (
            <PriceRow label="Priplatek za patra" value={calc.breakdown.floorSurcharge} />
          )}
          {calc.breakdown.distanceSurcharge > 0 && (
            <PriceRow label="Priplatek za vzdalenost" value={calc.breakdown.distanceSurcharge} />
          )}
          {/* Materials used */}
          {(Object.entries(calc.materials) as [keyof MaterialOrder, number][])
            .filter(([, v]) => v > 0)
            .map(([key, value]) => (
              <div key={key} className="flex items-center justify-between px-4 py-2 text-sm">
                <span className="text-muted-foreground">{MATERIAL_LABELS[key]}</span>
                <span className="font-mono text-muted-foreground">{value} {MATERIAL_UNITS[key]}</span>
              </div>
            ))}
        </div>
      )}

      {/* Items summary — compact inline */}
      <div className="rounded-2xl border border-border bg-card px-4 py-3">
        <p className="text-xs text-muted-foreground mb-2">Soupis</p>
        <div className="flex flex-col gap-0.5 text-sm">
          {job.mode === "quick"
            ? (job.quickRooms ?? []).map((room) => (
                <div key={room.id} className="flex justify-between">
                  <span>{ROOM_LABELS[room.type]}</span>
                  <span className="font-mono text-muted-foreground">{room.percent}%</span>
                </div>
              ))
            : (job.rooms ?? []).map((room) => (
                <div key={room.id} className="flex justify-between">
                  <span>
                    {ROOM_LABELS[room.type]}
                    {room.customName ? ` (${room.customName})` : ""}
                  </span>
                  <span className="text-muted-foreground">
                    {room.items.length === 0
                      ? "0 pol."
                      : `${room.items.reduce((sum, i) => sum + i.quantity, 0)} pol.`}
                  </span>
                </div>
              ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur py-4 -mx-4 px-4 border-t border-border mt-auto">
        <div className="flex gap-3">
          <Button variant="outline" size="lg" className="h-14 flex-1" onClick={onBack}>
            &larr; Zpet
          </Button>
          <Button size="lg" className="h-14 flex-1 text-base" onClick={onNext}>
            Vygenerovat nabidku &rarr;
          </Button>
        </div>
      </div>
    </div>
  )
}

function PriceRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between px-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{formatPrice(value)}</span>
    </div>
  )
}

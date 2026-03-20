"use client"

import { useState } from "react"
import type { Job } from "@/lib/types"
import { calculateJob, formatPrice, formatVolume } from "@/lib/calculator"
import { ROOM_LABELS } from "@/lib/types"
import { getCatalogItem } from "@/lib/catalog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Pencil } from "lucide-react"

interface StepQuoteProps {
  job: Job
  onBack: () => void
  onNewJob: () => void
  onGoToCalc?: () => void
}

export function StepQuote({ job, onBack, onNewJob, onGoToCalc }: StepQuoteProps) {
  const calc = calculateJob(job)
  const [priceOverride, setPriceOverride] = useState<number | null>(null)
  const [editingPrice, setEditingPrice] = useState(false)
  const [quoteNote, setQuoteNote] = useState("")

  const displayPrice = priceOverride ?? calc.totalPrice

  const dateFormatted = job.date
    ? new Date(job.date).toLocaleDateString("cs-CZ", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "\u2014"

  function handleShare() {
    const text = `Nabidka stehovani \u2013 ${formatPrice(displayPrice)}\n${job.client.name}\n${dateFormatted}`
    if (navigator.share) {
      navigator.share({ title: "Nabidka stehovani", text }).catch(() => {})
    } else {
      navigator.clipboard.writeText(text).catch(() => {})
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Preview header with draft badge */}
      <div className="flex flex-col items-center gap-3 pt-4 text-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Nahled nabidky</span>
          <span className="inline-flex items-center rounded-full bg-amber-400/15 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
            Navrh
          </span>
        </div>
        <h2 className="text-2xl font-bold">Nabidka stehovani</h2>
        <p className="text-muted-foreground">
          {job.client.name || "Klient"}
        </p>

        {/* Inline editable price */}
        {editingPrice ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              inputMode="numeric"
              value={priceOverride ?? calc.totalPrice}
              onChange={(e) => setPriceOverride(Number(e.target.value) || 0)}
              className="w-40 text-center font-mono text-2xl font-bold"
              autoFocus
            />
            <span className="text-lg text-muted-foreground">Kc</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingPrice(false)}
            >
              OK
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditingPrice(true)}
            className="group flex items-center gap-2 font-mono text-4xl font-bold transition-colors hover:text-primary"
          >
            <span>{formatPrice(displayPrice)}</span>
            <Pencil className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
        {priceOverride !== null && priceOverride !== calc.totalPrice && (
          <p className="text-xs text-muted-foreground">
            Kalkulovano: {formatPrice(calc.totalPrice)} (upraveno manualne)
          </p>
        )}
      </div>

      <Separator />

      {/* Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Detaily</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <DetailRow label="Termin" value={dateFormatted} />
          <DetailRow label="Odkud" value={job.pickup.address || "\u2014"} />
          <DetailRow
            label=""
            value={`${job.pickup.floor}. patro${job.pickup.elevator ? " (vytah)" : ""}`}
          />
          <DetailRow label="Kam" value={job.delivery.address || "\u2014"} />
          <DetailRow
            label=""
            value={`${job.delivery.floor}. patro${job.delivery.elevator ? " (vytah)" : ""}`}
          />
          <DetailRow label="Vzdalenost" value={`${job.distance} km`} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Rozsah prace</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <DetailRow label="Objem" value={formatVolume(calc.totalVolume)} />
          <DetailRow label="Pocet aut" value={`${calc.truckCount}`} />
          <DetailRow label="Pracovniku" value={`${calc.workerCount}`} />
          <DetailRow label="Odhadovany cas" value={`${calc.estimatedHours} hod`} />
          <Separator className="my-1" />
          {job.mode === "quick"
            ? (job.quickRooms ?? []).map((room) => (
                <div key={room.id} className="flex justify-between group/item">
                  <span className="font-medium">{ROOM_LABELS[room.type]}</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-muted-foreground">{room.percent}%</span>
                    <Pencil className="size-3 text-muted-foreground/50 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))
            : (job.rooms ?? []).map((room) => (
            <div key={room.id} className="flex flex-col gap-0.5 group/item">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {ROOM_LABELS[room.type]}
                  {room.customName ? ` (${room.customName})` : ""}
                </span>
                <Pencil className="size-3 text-muted-foreground/50 opacity-0 group-hover/item:opacity-100 transition-opacity" />
              </div>
              {room.items.map((item) => {
                const cat = getCatalogItem(item.catalogId)
                if (!cat) return null
                const services = [
                  item.services.disassembly && "demontaz",
                  item.services.packing && "baleni",
                  item.services.assembly && "montaz",
                ].filter(Boolean)
                return (
                  <span key={item.id} className="pl-4 text-muted-foreground">
                    {item.quantity}x {cat.name}
                    {services.length > 0 && ` (${services.join(", ")})`}
                  </span>
                )
              })}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Cena</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm">
          <PriceLine label="Doprava" value={calc.breakdown.trucks} />
          <PriceLine label="Prace" value={calc.breakdown.labor} />
          <PriceLine label="Material + sluzby" value={calc.breakdown.materials} />
          {calc.breakdown.floorSurcharge > 0 && (
            <PriceLine label="Priplatek patra" value={calc.breakdown.floorSurcharge} />
          )}
          {calc.breakdown.distanceSurcharge > 0 && (
            <PriceLine label="Priplatek vzdalenost" value={calc.breakdown.distanceSurcharge} />
          )}
          <Separator className="my-2" />
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Celkem</span>
            <span className="font-mono">{formatPrice(displayPrice)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Quote note */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Poznamka k nabidce</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={quoteNote}
            onChange={(e) => setQuoteNote(e.target.value)}
            placeholder="Doplnujici informace pro klienta..."
            className="w-full min-h-[80px] rounded-lg border border-input bg-transparent px-2.5 py-2.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y"
          />
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Cena je orientacni a muze se lisit dle skutecneho rozsahu prace.
        Platnost nabidky 14 dni.
      </p>

      {/* Actions */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur py-4 -mx-4 px-4 border-t border-border mt-auto">
        <div className="flex flex-col gap-3">
          <Button size="lg" className="h-14 text-base" onClick={handleShare}>
            Potvrdit a odeslat nabidku
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" size="lg" className="h-14 flex-1" onClick={onBack}>
              &larr; Zpet
            </Button>
            {onGoToCalc && (
              <Button variant="outline" size="lg" className="h-14 flex-1" onClick={onGoToCalc}>
                Upravit kalkulaci
              </Button>
            )}
          </div>
          <button
            type="button"
            onClick={onNewJob}
            className="text-sm text-muted-foreground text-center py-2 hover:text-foreground transition-colors"
          >
            Nova zakazka
          </button>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  )
}

function PriceLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{formatPrice(value)}</span>
    </div>
  )
}

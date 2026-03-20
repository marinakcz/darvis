"use client"

import type { Job, MaterialOrder } from "@/lib/types"
import { calculateJob, formatPrice, formatVolume } from "@/lib/calculator"
import { ROOM_LABELS, MATERIAL_LABELS, MATERIAL_UNITS } from "@/lib/types"
import { getCatalogItem } from "@/lib/catalog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface StepQuoteProps {
  job: Job
  onBack: () => void
  onNewJob: () => void
}

export function StepQuote({ job, onBack, onNewJob }: StepQuoteProps) {
  const calc = calculateJob(job)
  const dateFormatted = job.date
    ? new Date(job.date).toLocaleDateString("cs-CZ", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—"

  function handleShare() {
    const text = `Nabídka stěhování – ${formatPrice(calc.totalPrice)}\n${job.client.name}\n${dateFormatted}`
    if (navigator.share) {
      navigator.share({ title: "Nabídka stěhování", text }).catch(() => {})
    } else {
      navigator.clipboard.writeText(text).catch(() => {})
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Quote header */}
      <div className="flex flex-col items-center gap-2 pt-4 text-center">
        <h2 className="text-2xl font-bold">Nabídka stěhování</h2>
        <p className="text-muted-foreground">
          {job.client.name || "Klient"}
        </p>
        <div className="font-mono text-4xl font-bold">
          {formatPrice(calc.totalPrice)}
        </div>
      </div>

      <Separator />

      {/* Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Detaily</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <DetailRow label="Termín" value={dateFormatted} />
          <DetailRow label="Odkud" value={job.pickup.address || "—"} />
          <DetailRow
            label=""
            value={`${job.pickup.floor}. patro${job.pickup.elevator ? " (výtah)" : ""}`}
          />
          <DetailRow label="Kam" value={job.delivery.address || "—"} />
          <DetailRow
            label=""
            value={`${job.delivery.floor}. patro${job.delivery.elevator ? " (výtah)" : ""}`}
          />
          <DetailRow label="Vzdálenost" value={`${job.distance} km`} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Rozsah práce</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <DetailRow label="Objem" value={formatVolume(calc.totalVolume)} />
          <DetailRow label="Počet aut" value={`${calc.truckCount}`} />
          <DetailRow label="Pracovníků" value={`${calc.workerCount}`} />
          <DetailRow label="Odhadovaný čas" value={`${calc.estimatedHours} hod`} />
          <Separator className="my-1" />
          {job.mode === "quick"
            ? (job.quickRooms ?? []).map((room) => (
                <div key={room.id} className="flex justify-between">
                  <span className="font-medium">{ROOM_LABELS[room.type]}</span>
                  <span className="font-mono text-muted-foreground">{room.percent}%</span>
                </div>
              ))
            : (job.rooms ?? []).map((room) => (
            <div key={room.id} className="flex flex-col gap-0.5">
              <span className="font-medium">
                {ROOM_LABELS[room.type]}
                {room.customName ? ` (${room.customName})` : ""}
              </span>
              {room.items.map((item) => {
                const cat = getCatalogItem(item.catalogId)
                if (!cat) return null
                const services = [
                  item.services.disassembly && "demontáž",
                  item.services.packing && "balení",
                  item.services.assembly && "montáž",
                ].filter(Boolean)
                return (
                  <span key={item.id} className="pl-4 text-muted-foreground">
                    {item.quantity}× {cat.name}
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
          <PriceLine label="Práce" value={calc.breakdown.labor} />
          <PriceLine label="Materiál + služby" value={calc.breakdown.materials} />
          {calc.breakdown.floorSurcharge > 0 && (
            <PriceLine label="Příplatek patra" value={calc.breakdown.floorSurcharge} />
          )}
          {calc.breakdown.distanceSurcharge > 0 && (
            <PriceLine label="Příplatek vzdálenost" value={calc.breakdown.distanceSurcharge} />
          )}
          <Separator className="my-2" />
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Celkem</span>
            <span className="font-mono">{formatPrice(calc.totalPrice)}</span>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Cena je orientační a může se lišit dle skutečného rozsahu práce.
        Platnost nabídky 14 dní.
      </p>

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2">
        <Button size="lg" className="h-14 text-base" onClick={handleShare}>
          Sdílet nabídku
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" size="lg" className="h-14 flex-1" onClick={onBack}>
            ← Zpět
          </Button>
          <Button variant="outline" size="lg" className="h-14 flex-1" onClick={onNewJob}>
            Nová zakázka
          </Button>
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

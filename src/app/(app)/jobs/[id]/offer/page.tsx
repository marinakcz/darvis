"use client"

import { use, useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronDown, ChevronUp, Truck, Pencil, Share2, Loader2 } from "lucide-react"
import type { Job, SurveyRoom } from "@/lib/types"
import { ROOM_LABELS } from "@/lib/types"
import { calculateJob, formatPrice, formatVolume } from "@/lib/calculator"
import { VEHICLES } from "@/lib/constants"
import { RoomIcon } from "@/components/icons"
import { Surface, Group, Row, Stat, ActionButton, GhostButton, SectionHeader } from "@/components/ds"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"

function useIsMounted() {
  return useSyncExternalStore(() => () => {}, () => true, () => false)
}

function getRoomSummary(room: SurveyRoom): string {
  if (room.mode === "quick") return `${room.percent}%`
  return `${room.items.reduce((sum, i) => sum + i.quantity, 0)} pol.`
}

/** Load job from DB API */
function useJobFromDb(jobId: string, mounted: boolean) {
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)

  if (mounted && !loaded) {
    setLoaded(true)
    fetch(`/api/jobs/${jobId}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found")
        return r.json()
      })
      .then((data) => {
        const rooms = (data.rooms || []) as Array<Record<string, unknown>>
        setJob({
          mode: "quick",
          jobType: data.jobType || "apartment",
          vehicleId: data.vehicleId || "medium-24",
          client: data.customer
            ? { name: data.customer.name || "", phone: data.customer.phone || "", email: data.customer.email || "" }
            : { name: "", phone: "", email: "" },
          pickup: { address: data.pickupAddress || "", floor: data.pickupFloor || 0, elevator: data.pickupElevator || false },
          delivery: { address: data.deliveryAddress || "", floor: data.deliveryFloor || 0, elevator: data.deliveryElevator || false },
          distance: Number(data.distance) || 0,
          date: data.date || "",
          rooms: [],
          quickRooms: [],
          surveyRooms: rooms.map((r): SurveyRoom => ({
            id: r.id as string,
            type: r.type as SurveyRoom["type"],
            customName: r.customName as string | undefined,
            mode: (r.mode as SurveyRoom["mode"]) || "quick",
            percent: (r.percent as number) || 0,
            items: ((r.items as Array<Record<string, unknown>>) || []).map((i) => ({
              id: i.id as string,
              catalogId: i.catalogId as string,
              quantity: (i.quantity as number) || 1,
              services: { disassembly: (i.disassembly as boolean) || false, packing: (i.packing as boolean) || false, assembly: (i.assembly as boolean) || false },
              notes: i.notes as string | undefined,
            })),
          })),
          materials: data.materials || { boxes: 0, crates: 0, stretchWrap: 0, bubbleWrap: 0, packingPaper: 0 },
          access: data.access || { parking: "easy", narrowPassage: false, narrowNote: "", entryDistance: "short" },
          fromCRM: data.fromCRM || false,
          technicianNotes: data.technicianNotes,
          dispatcherNote: data.dispatcherNote,
        } as Job)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  return { job, loading }
}

export default function OfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = use(params)
  const mounted = useIsMounted()
  const router = useRouter()
  const { job, loading } = useJobFromDb(jobId, mounted)
  const [priceOverride, setPriceOverride] = useState<number | null>(null)
  const [editingPrice, setEditingPrice] = useState(false)
  const [quoteNote, setQuoteNote] = useState("")
  const [breakdownExpanded, setBreakdownExpanded] = useState(false)
  const [roomsExpanded, setRoomsExpanded] = useState(false)
  const [detailsExpanded, setDetailsExpanded] = useState(false)
  const [sending, setSending] = useState(false)
  const [offerUrl, setOfferUrl] = useState<string | null>(null)

  if (!mounted || loading || !job) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-text-tertiary" />
      </div>
    )
  }

  const calc = calculateJob(job)
  const displayPrice = priceOverride ?? calc.totalPrice

  // Client-facing breakdown logic:
  // - Price lowered → original breakdown + "Sleva" row
  // - Price raised → proportionally scale breakdown items (no trace)
  // - No override → original breakdown
  const priceDiff = displayPrice - calc.totalPrice
  const isDiscount = priceOverride !== null && priceDiff < 0
  const isMarkup = priceOverride !== null && priceDiff > 0

  const clientBreakdown = (() => {
    if (!isMarkup) return calc.breakdown
    // Proportionally scale all items so they sum to displayPrice
    const ratio = displayPrice / calc.totalPrice
    return {
      trucks: Math.round(calc.breakdown.trucks * ratio),
      labor: Math.round(calc.breakdown.labor * ratio),
      materials: Math.round(calc.breakdown.materials * ratio),
      floorSurcharge: Math.round(calc.breakdown.floorSurcharge * ratio),
      distanceSurcharge: Math.round(calc.breakdown.distanceSurcharge * ratio),
    }
  })()
  const selectedVehicle = VEHICLES.find((v) => v.id === job.vehicleId) ?? VEHICLES[2]
  const dateFormatted = job.date
    ? new Date(job.date).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "—"

  async function handleSendOffer() {
    setSending(true)
    try {
      const res = await fetch(`/api/jobs/${jobId}/offer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(priceOverride !== null && priceOverride !== calc.totalPrice ? { customPrice: priceOverride } : {}),
      })
      if (res.ok) {
        const data = await res.json()
        const fullUrl = `${window.location.origin}/offer/${data.token}`
        setOfferUrl(fullUrl)

        // Share or copy
        const text = `Nabídka stěhování – ${formatPrice(displayPrice)}\n${job?.client.name ?? ""}\n${dateFormatted}\n\n${fullUrl}`
        if (navigator.share) {
          navigator.share({ title: "Nabídka stěhování", text }).catch(() => {})
        } else {
          navigator.clipboard.writeText(fullUrl).catch(() => {})
        }
      }
    } catch { /* ignore */ }
    setSending(false)
  }

  return (
    <div className="flex flex-1 flex-col ios-slide-in">
      <header className="sticky top-0 z-40 border-b border-border bg-surface-0/80 backdrop-blur-xl px-4 py-2.5">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => router.push(`/jobs/${jobId}/survey`)} aria-label="Zpět na zaměření"
            className="flex items-center justify-center size-9 -ml-1 rounded-lg text-text-secondary hover:bg-surface-2 active:bg-surface-2 transition-colors">
            <ChevronLeft className="size-5" />
          </button>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-semibold truncate">Nabídka</span>
            <span className="text-[11px] text-text-tertiary truncate">{job.client.name}</span>
          </div>
          <span className="inline-flex items-center rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning">Návrh</span>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 px-4 py-4 pb-40 overflow-y-auto">
        {/* Big price */}
        <div className="flex flex-col items-center gap-2 pt-4">
          <h2 className="text-lg text-text-secondary">Nabídka stěhování</h2>
          {editingPrice ? (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <Input type="number" inputMode="numeric" value={priceOverride ?? calc.totalPrice}
                  onChange={(e) => setPriceOverride(Number(e.target.value) || 0)}
                  aria-label="Cena nabídky"
                  className="w-44 text-center font-mono text-2xl font-bold bg-surface-2 border-0 h-14" autoFocus />
                <span className="text-lg text-text-secondary">Kč</span>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => { setPriceOverride(null); setEditingPrice(false) }}
                  className="px-4 py-2.5 rounded-xl bg-surface-2 text-sm text-text-secondary hover:bg-surface-3 transition-colors min-h-[44px]">
                  Kalkulace
                </button>
                <button type="button" onClick={() => setEditingPrice(false)}
                  className="px-4 py-2.5 rounded-xl bg-success text-success-foreground text-sm font-medium hover:bg-success/90 transition-colors min-h-[44px]">
                  Potvrdit
                </button>
              </div>
              <p className="text-xs text-text-tertiary">Kalkulace: {formatPrice(calc.totalPrice)}</p>
            </div>
          ) : (
            <button type="button" onClick={() => setEditingPrice(true)}
              className="group flex items-center gap-2 font-mono text-4xl font-bold transition-colors active:text-success">
              <span>{formatPrice(displayPrice)}</span>
              <Pencil className="size-4 text-text-tertiary group-active:text-success transition-opacity" />
            </button>
          )}
          {!editingPrice && priceOverride !== null && priceOverride !== calc.totalPrice && (
            <div className="flex flex-col items-center gap-0.5">
              <p className="text-xs text-text-tertiary">
                Kalkulace: {formatPrice(calc.totalPrice)}
                <span className="ml-1.5 font-mono">
                  ({priceOverride > calc.totalPrice ? "+" : ""}{formatPrice(priceOverride - calc.totalPrice)})
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        <Surface className="flex items-center justify-around px-4 py-3">
          <Stat label="Objem" value={formatVolume(calc.totalVolume)} />
          <Separator orientation="vertical" className="h-8" />
          <Stat label="Aut" value={`${calc.truckCount}x`} />
          <Separator orientation="vertical" className="h-8" />
          <Stat label="Lidí" value={`${calc.workerCount}`} />
          <Separator orientation="vertical" className="h-8" />
          <Stat label="Hodin" value={`${calc.estimatedHours}h`} />
        </Surface>

        {/* Vehicle */}
        <Surface className="px-4 py-3">
          <div className="flex items-center gap-2">
            <Truck className="size-4 text-text-tertiary" />
            <span className="text-sm font-medium">{selectedVehicle.name}</span>
            <span className="text-xs font-mono text-text-tertiary">{formatPrice(selectedVehicle.hourlyRate)}/hod</span>
          </div>
        </Surface>

        {/* Price breakdown — as client will see it */}
        <CollapsibleSection title="Rozpis ceny" expanded={breakdownExpanded} onToggle={() => setBreakdownExpanded((p) => !p)}>
          <Group>
            <PriceRow label="Doprava (auta)" value={clientBreakdown.trucks} />
            <PriceRow label="Práce" value={clientBreakdown.labor} />
            <PriceRow label="Materiál + služby" value={clientBreakdown.materials} />
            {clientBreakdown.floorSurcharge > 0 && <PriceRow label="Příplatek za patra" value={clientBreakdown.floorSurcharge} />}
            {clientBreakdown.distanceSurcharge > 0 && <PriceRow label="Příplatek za vzdálenost" value={clientBreakdown.distanceSurcharge} />}
            {isDiscount && <PriceRow label="Sleva" value={priceDiff} />}
          </Group>
        </CollapsibleSection>

        {/* Rooms */}
        <CollapsibleSection title={`Místnosti (${job.surveyRooms.length})`} expanded={roomsExpanded} onToggle={() => setRoomsExpanded((p) => !p)}>
          <Group>
            {job.surveyRooms.map((room) => {
              const Icon = RoomIcon[room.type]
              return (
                <div key={room.id} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-text-tertiary" />
                    <span className="text-sm">{ROOM_LABELS[room.type]}</span>
                  </div>
                  <span className="font-mono text-sm text-text-secondary">{getRoomSummary(room)}</span>
                </div>
              )
            })}
          </Group>
        </CollapsibleSection>

        {/* Details */}
        <CollapsibleSection title="Detaily" expanded={detailsExpanded} onToggle={() => setDetailsExpanded((p) => !p)}>
          <Group>
            <Row label="Termín" value={dateFormatted} />
            <Row label="Odkud" value={`${job.pickup.address} · ${job.pickup.floor}. p.${job.pickup.elevator ? " (výtah)" : ""}`} />
            <Row label="Kam" value={`${job.delivery.address} · ${job.delivery.floor}. p.${job.delivery.elevator ? " (výtah)" : ""}`} />
            <Row label="Vzdálenost" value={`${job.distance} km`} mono />
          </Group>
        </CollapsibleSection>

        {/* Note */}
        <div className="flex flex-col gap-2">
          <SectionHeader>Poznámka pro klienta</SectionHeader>
          <textarea value={quoteNote} onChange={(e) => setQuoteNote(e.target.value)}
            placeholder="Doplňující informace pro klienta..."
            aria-label="Poznámka pro klienta"
            className="w-full min-h-[80px] rounded-2xl bg-surface-1 px-4 py-3 text-sm transition-colors outline-none placeholder:text-text-tertiary focus-visible:ring-2 focus-visible:ring-ring/50 resize-y" />
        </div>

        {/* Offer URL */}
        {offerUrl && (
          <Surface className="px-4 py-3">
            <p className="text-xs text-text-tertiary mb-1">Odkaz na nabídku:</p>
            <p className="text-sm font-mono text-success break-all">{offerUrl}</p>
          </Surface>
        )}

        <p className="text-center text-xs text-text-tertiary">
          Cena je orientační a může se lišit dle skutečného rozsahu práce. Platnost nabídky 14 dní.
        </p>
      </main>

      {/* Sticky bottom */}
      <div className="sticky bottom-0 z-40 border-t border-border bg-surface-0/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
        <div className="flex flex-col gap-2 px-4 py-3">
          {offerUrl ? (
            <>
              <ActionButton onClick={() => router.push("/dashboard")}>
                Hotovo
              </ActionButton>
              <GhostButton onClick={handleSendOffer}>
                <Share2 className="size-4" /> Sdílet znovu
              </GhostButton>
            </>
          ) : (
            <>
              <ActionButton onClick={handleSendOffer} disabled={sending || job.surveyRooms.length === 0}>
                {sending ? <Loader2 className="size-5 animate-spin" /> : <Share2 className="size-5" />}
                Odeslat nabídku klientovi
              </ActionButton>
              <GhostButton onClick={() => router.push(`/jobs/${jobId}/survey`)}>
                ← Zpět na zaměření
              </GhostButton>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function CollapsibleSection({ title, expanded, onToggle, children }: {
  title: string; expanded: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <>
      <button type="button" onClick={onToggle} aria-expanded={expanded}
        className="flex items-center justify-between rounded-2xl bg-surface-1 px-4 py-3 min-h-[44px] w-full text-left transition-colors hover:bg-surface-2 active:bg-surface-2">
        <span className="text-sm font-medium">{title}</span>
        {expanded ? <ChevronUp className="size-4 text-text-tertiary" /> : <ChevronDown className="size-4 text-text-tertiary" />}
      </button>
      {expanded && children}
    </>
  )
}

function PriceRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-sm">
      <span className="text-text-secondary">{label}</span>
      <span className="font-mono">{formatPrice(value)}</span>
    </div>
  )
}

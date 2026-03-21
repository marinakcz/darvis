"use client"

import { use, useSyncExternalStore } from "react"
import type { Job, SurveyRoom } from "@/lib/types"
import { ROOM_LABELS } from "@/lib/types"
import { calculateJob, formatPrice, formatVolume } from "@/lib/calculator"

function useIsMounted() {
  return useSyncExternalStore(() => () => {}, () => true, () => false)
}

function loadOffer(token: string): Job | null {
  try {
    const saved = localStorage.getItem(`darvis-survey-${token}`)
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return null
}

function getRoomSummary(room: SurveyRoom): string {
  if (room.mode === "quick") return `${room.percent}%`
  return `${room.items.reduce((sum, i) => sum + i.quantity, 0)} pol.`
}

export default function PublicOfferPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const mounted = useIsMounted()

  if (!mounted) return null

  const job = loadOffer(token)

  if (!job || job.surveyRooms.length === 0) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="text-xl font-bold mb-2">Nabídka nenalezena</h1>
          <p className="text-sm text-zinc-500">Odkaz na nabídku není platný nebo vypršel.</p>
        </div>
      </div>
    )
  }

  const calc = calculateJob(job)
  const dateFormatted = job.date
    ? new Date(job.date).toLocaleDateString("cs-CZ", { weekday: "short", day: "numeric", month: "long", year: "numeric" })
    : "—"

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Header */}
      <header className="border-b border-zinc-200 px-4 py-4">
        <div className="mx-auto max-w-lg flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-zinc-900">Stěhování Praha</h1>
            <p className="text-xs text-zinc-500">Profesionální stěhovací služby</p>
          </div>
          <a
            href="tel:+420800123456"
            className="flex items-center gap-1.5 rounded-lg bg-zinc-900 text-white px-3 py-2 text-sm font-medium hover:bg-zinc-800 transition-colors"
          >
            Zavolat
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6 flex flex-col gap-6">
        {/* Title + price */}
        <div className="text-center">
          <p className="text-sm text-zinc-500 mb-1">Nabídka stěhování pro</p>
          <h2 className="text-xl font-bold mb-4">{job.client.name || "Klient"}</h2>
          <p className="text-4xl font-bold font-mono">{formatPrice(calc.totalPrice)}</p>
          <p className="text-sm text-zinc-500 mt-1">{dateFormatted}</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <StatBox label="Objem" value={formatVolume(calc.totalVolume)} />
          <StatBox label="Aut" value={`${calc.truckCount}x`} />
          <StatBox label="Lidí" value={`${calc.workerCount}`} />
          <StatBox label="Hodin" value={`${calc.estimatedHours}h`} />
        </div>

        {/* Route */}
        <section className="rounded-xl border border-zinc-200 overflow-hidden divide-y divide-zinc-100">
          <div className="px-4 py-3">
            <p className="text-xs text-zinc-400 mb-0.5">Odkud</p>
            <p className="text-sm">{job.pickup.address}</p>
            <p className="text-xs text-zinc-400">{job.pickup.floor}. patro{job.pickup.elevator ? " s výtahem" : " bez výtahu"}</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-zinc-400 mb-0.5">Kam</p>
            <p className="text-sm">{job.delivery.address}</p>
            <p className="text-xs text-zinc-400">{job.delivery.floor}. patro{job.delivery.elevator ? " s výtahem" : " bez výtahu"}</p>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-xs text-zinc-400">Vzdálenost</span>
            <span className="text-sm font-mono">{job.distance} km</span>
          </div>
        </section>

        {/* Rooms */}
        {job.surveyRooms.length > 0 && (
          <section className="rounded-xl border border-zinc-200 overflow-hidden" aria-label="Rozsah práce">
            <div className="px-4 py-2.5 bg-zinc-50 text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Rozsah práce
            </div>
            <div className="divide-y divide-zinc-100">
              {job.surveyRooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span>{ROOM_LABELS[room.type]}{room.customName ? ` (${room.customName})` : ""}</span>
                  <span className="font-mono text-zinc-500">{getRoomSummary(room)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Price breakdown */}
        <section className="rounded-xl border border-zinc-200 overflow-hidden" aria-label="Rozpis ceny">
          <div className="px-4 py-2.5 bg-zinc-50 text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Rozpis ceny
          </div>
          <div className="divide-y divide-zinc-100">
            <BreakdownRow label="Doprava" value={calc.breakdown.trucks} />
            <BreakdownRow label="Práce" value={calc.breakdown.labor} />
            <BreakdownRow label="Materiál + služby" value={calc.breakdown.materials} />
            {calc.breakdown.floorSurcharge > 0 && <BreakdownRow label="Příplatek patra" value={calc.breakdown.floorSurcharge} />}
            {calc.breakdown.distanceSurcharge > 0 && <BreakdownRow label="Příplatek vzdálenost" value={calc.breakdown.distanceSurcharge} />}
            <div className="flex items-center justify-between px-4 py-3 text-base font-bold">
              <span>Celkem</span>
              <span className="font-mono">{formatPrice(calc.totalPrice)}</span>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <p className="text-center text-xs text-zinc-400 leading-relaxed">
          Cena je orientační a může se lišit dle skutečného rozsahu práce.
          Platnost nabídky 14 dní od data vystavení.
          Pojištění zásilky do 20 000 000 Kč v ceně.
        </p>

        {/* CTA */}
        <div className="flex flex-col gap-3 pt-2">
          <a
            href="tel:+420800123456"
            className="flex items-center justify-center h-14 rounded-xl bg-zinc-900 text-white text-base font-medium hover:bg-zinc-800 transition-colors"
          >
            Mám dotaz — zavolat
          </a>
          <p className="text-center text-xs text-zinc-400">
            Stěhování Praha · +420 800 123 456
          </p>
        </div>
      </main>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-lg border border-zinc-200 py-2.5">
      <span className="font-mono text-base font-bold">{value}</span>
      <span className="text-[10px] text-zinc-400">{label}</span>
    </div>
  )
}

function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-sm">
      <span className="text-zinc-600">{label}</span>
      <span className="font-mono">{formatPrice(value)}</span>
    </div>
  )
}

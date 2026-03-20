"use client"

import { use, useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronDown, ChevronUp, Phone, Navigation2, ClipboardCheck } from "lucide-react"
import { NavigationSheet, useNavigationSheet } from "@/components/navigation-sheet"
import { Surface, Group, Row, Alert, ActionButton, SectionHeader } from "@/components/ds"
import { getMockJobById } from "@/lib/mock-data"

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

export default function BriefingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const mounted = useIsMounted()
  const router = useRouter()
  const [accessExpanded, setAccessExpanded] = useState(false)
  const [techNotes, setTechNotes] = useState("")
  const { navAddress, openNav, closeNav } = useNavigationSheet()

  if (!mounted) return null

  const job = getMockJobById(id)
  if (!job) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-text-secondary">Zakázka nenalezena.</p>
      </div>
    )
  }

  const dateFormatted = new Date(job.date).toLocaleDateString("cs-CZ", {
    weekday: "short", day: "numeric", month: "long",
  })

  const statusBg = job.statusColor === "text-blue-400" ? "bg-blue-400/15 text-blue-400"
    : job.statusColor === "text-green-400" ? "bg-green-400/15 text-green-400"
    : job.statusColor === "text-purple-400" ? "bg-purple-400/15 text-purple-400"
    : "bg-yellow-400/15 text-yellow-400"

  const floorInfo = (floor: number, elevator: boolean) =>
    `${floor}. patro${elevator ? " s výtahem" : " bez výtahu"}`

  return (
    <div className="flex flex-1 flex-col ios-slide-in">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface-0/80 backdrop-blur-xl px-4 py-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            aria-label="Zpět"
            className="flex items-center justify-center size-9 -ml-1 rounded-lg text-text-secondary hover:bg-surface-2 active:bg-surface-2 transition-colors"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-semibold truncate">{job.client}</span>
            <span className="text-[11px] text-text-tertiary truncate">{job.name.split(" — ")[1]}</span>
          </div>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${statusBg}`}>{job.statusLabel}</span>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 px-4 py-4 pb-24">
        {/* Client card */}
        <Surface className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-base font-semibold">{job.client}</span>
              <span className="text-xs text-text-secondary">{dateFormatted}</span>
            </div>
            <a
              href={`tel:${job.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-1.5 rounded-xl bg-success/15 text-success px-3 py-2 text-sm font-medium hover:bg-success/25 active:bg-success/25 transition-colors"
            >
              <Phone className="size-4" />
              Zavolat
            </a>
          </div>
        </Surface>

        {/* Route */}
        <Group>
            {/* Pickup */}
            <div className="flex items-center justify-between gap-2 px-4 py-3 min-h-[44px]">
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-text-tertiary">Nakládka</span>
                <span className="text-sm truncate">{job.pickup}</span>
                <span className="text-xs text-text-tertiary">{floorInfo(job.floor.pickup, job.elevator.pickup)}</span>
              </div>
              <button
                type="button"
                onClick={() => openNav(job.pickup)}
                className="flex items-center gap-1 rounded-lg bg-surface-3 px-2.5 py-1.5 text-xs text-text-secondary shrink-0 min-h-[36px] hover:bg-surface-3/80 active:bg-surface-3/80 transition-colors"
              >
                <Navigation2 className="size-3.5" />
                <span>Navigovat</span>
              </button>
            </div>

            {/* Delivery */}
            <div className="flex items-center justify-between gap-2 px-4 py-3 min-h-[44px]">
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-text-tertiary">Vykládka</span>
                <span className="text-sm truncate">{job.delivery}</span>
                <span className="text-xs text-text-tertiary">{floorInfo(job.floor.delivery, job.elevator.delivery)}</span>
              </div>
              <button
                type="button"
                onClick={() => openNav(job.delivery)}
                className="flex items-center gap-1 rounded-lg bg-surface-3 px-2.5 py-1.5 text-xs text-text-secondary shrink-0 min-h-[36px] hover:bg-surface-3/80 active:bg-surface-3/80 transition-colors"
              >
                <Navigation2 className="size-3.5" />
                <span>Navigovat</span>
              </button>
            </div>

            {/* Distance */}
            <Row label="Vzdálenost" value={`${job.distance} km`} mono />
          </Group>

        {/* Dispatcher note */}
        {job.dispatcherNote && (
          <Alert variant="warning" title="Poznámka dispečinku">
            {job.dispatcherNote}
          </Alert>
        )}

        {/* Access — collapsible */}
        <button
          type="button"
          onClick={() => setAccessExpanded((prev) => !prev)}
          className="flex items-center justify-between rounded-2xl bg-surface-1 px-4 py-3 min-h-[44px] w-full text-left transition-colors hover:bg-surface-2 active:bg-surface-2"
        >
          <span className="text-sm font-medium text-text-secondary">Přístup</span>
          {accessExpanded ? <ChevronUp className="size-4 text-text-tertiary" /> : <ChevronDown className="size-4 text-text-tertiary" />}
        </button>

        {accessExpanded && (
          <Group>
            <AccessRow label="Parkování" options={["Přímo", "Omezené", "Nutno řešit"]} />
            <Row label="Úzký průchod" value="Ne" />
            <AccessRow label="Vzdálenost ke vchodu" options={["Krátká", "Střední", "Dlouhá"]} />
          </Group>
        )}

        {/* Technician notes */}
        <div className="flex flex-col gap-2">
          <SectionHeader>Poznámky technika</SectionHeader>
          <textarea
            value={techNotes}
            onChange={(e) => setTechNotes(e.target.value)}
            placeholder="Vaše poznámky k zakázce..."
            className="w-full min-h-[80px] rounded-2xl bg-surface-1 px-4 py-3 text-sm transition-colors outline-none placeholder:text-text-tertiary focus-visible:ring-2 focus-visible:ring-ring/50 resize-y"
          />
        </div>

        {/* Price if exists */}
        {job.price !== "\u2014" && (
          <Surface>
            <Group>
              <Row label="Celkem" value={job.price} mono />
            </Group>
          </Surface>
        )}

      </main>

      {/* Sticky CTA */}
      {job.actionable && (
        <div className="sticky bottom-0 z-40 border-t border-border bg-surface-0/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
          <div className="px-4 py-3">
            <ActionButton onClick={() => router.push(`/jobs/${id}/survey`)}>
              <ClipboardCheck className="size-5" />
              Zahájit zaměření
            </ActionButton>
          </div>
        </div>
      )}

      {navAddress && <NavigationSheet address={navAddress} onClose={closeNav} />}
    </div>
  )
}

function AccessRow({ label, options }: { label: string; options: string[] }) {
  const [selected, setSelected] = useState(0)
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-2.5">
      <span className="text-sm text-text-secondary shrink-0">{label}</span>
      <div className="flex gap-1">
        {options.map((opt, i) => (
          <button
            key={opt}
            type="button"
            onClick={() => setSelected(i)}
            className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
              selected === i
                ? "bg-success text-success-foreground font-medium"
                : "bg-surface-3 text-text-secondary hover:bg-surface-3/80"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

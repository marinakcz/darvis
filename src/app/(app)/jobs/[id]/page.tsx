"use client"

import { use, useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronDown, ChevronUp, Phone, Navigation2, ClipboardCheck, Loader2 } from "lucide-react"
import { NavigationSheet, useNavigationSheet } from "@/components/navigation-sheet"
import { Surface, Group, Row, Alert, ActionButton, SectionHeader } from "@/components/ds"

function useIsMounted() {
  return useSyncExternalStore(() => () => {}, () => true, () => false)
}

interface JobDetail {
  id: string
  jobType: string
  status: string
  date: string | null
  pickupAddress: string
  pickupFloor: number
  pickupElevator: boolean
  deliveryAddress: string
  deliveryFloor: number
  deliveryElevator: boolean
  distance: string
  dispatcherNote: string | null
  technicianNotes: string | null
  customer: { name: string; phone: string; email: string } | null
}

export default function BriefingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const mounted = useIsMounted()
  const router = useRouter()
  const [job, setJob] = useState<JobDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [accessExpanded, setAccessExpanded] = useState(false)
  const [techNotes, setTechNotes] = useState("")
  const { navAddress, openNav, closeNav } = useNavigationSheet()

  // Load from DB
  if (mounted && !loaded) {
    setLoaded(true)
    fetch(`/api/jobs/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found")
        return r.json()
      })
      .then((data) => {
        setJob(data)
        setTechNotes(data.technicianNotes || "")
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  if (!mounted || loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-text-tertiary" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-text-secondary">Zakázka nenalezena.</p>
      </div>
    )
  }

  const dateFormatted = job.date
    ? new Date(job.date).toLocaleDateString("cs-CZ", { weekday: "short", day: "numeric", month: "long" })
    : "—"

  const floorInfo = (floor: number, elevator: boolean) =>
    `${floor}. patro${elevator ? " s výtahem" : " bez výtahu"}`

  const canStartSurvey = job.status === "draft" || job.status === "survey"

  return (
    <div className="flex flex-1 flex-col ios-slide-in">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface-0/80 backdrop-blur-xl px-4 py-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/jobs")}
            aria-label="Zpět"
            className="flex items-center justify-center size-9 -ml-1 rounded-lg text-text-secondary hover:bg-surface-2 active:bg-surface-2 transition-colors"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-semibold truncate">{job.customer?.name || "Nový klient"}</span>
            <span className="text-[11px] text-text-tertiary truncate">
              {(job.pickupAddress || "—").split(",")[0]} → {(job.deliveryAddress || "—").split(",")[0]}
            </span>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 px-4 py-4 pb-24">
        {/* Client card */}
        <Surface className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-base font-semibold">{job.customer?.name || "Nový klient"}</span>
              <span className="text-xs text-text-secondary">{dateFormatted}</span>
            </div>
            {job.customer?.phone && (
              <a
                href={`tel:${job.customer.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-1.5 rounded-xl bg-success/15 text-success px-3 py-2 text-sm font-medium hover:bg-success/25 active:bg-success/25 transition-colors"
              >
                <Phone className="size-4" />
                Zavolat
              </a>
            )}
          </div>
        </Surface>

        {/* Route */}
        {(job.pickupAddress || job.deliveryAddress) && (
          <Group>
            {/* Pickup */}
            <div className="flex items-center justify-between gap-2 px-4 py-3 min-h-[44px]">
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-text-tertiary">Nakládka</span>
                <span className="text-sm truncate">{job.pickupAddress || "—"}</span>
                <span className="text-xs text-text-tertiary">{floorInfo(job.pickupFloor, job.pickupElevator)}</span>
              </div>
              {job.pickupAddress && (
                <button
                  type="button"
                  onClick={() => openNav(job.pickupAddress)}
                  className="flex items-center gap-1 rounded-lg bg-surface-3 px-2.5 py-1.5 text-xs text-text-secondary shrink-0 min-h-[36px] hover:bg-surface-3/80 active:bg-surface-3/80 transition-colors"
                >
                  <Navigation2 className="size-3.5" />
                  <span>Navigovat</span>
                </button>
              )}
            </div>

            {/* Delivery */}
            <div className="flex items-center justify-between gap-2 px-4 py-3 min-h-[44px]">
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-text-tertiary">Vykládka</span>
                <span className="text-sm truncate">{job.deliveryAddress || "—"}</span>
                <span className="text-xs text-text-tertiary">{floorInfo(job.deliveryFloor, job.deliveryElevator)}</span>
              </div>
              {job.deliveryAddress && (
                <button
                  type="button"
                  onClick={() => openNav(job.deliveryAddress)}
                  className="flex items-center gap-1 rounded-lg bg-surface-3 px-2.5 py-1.5 text-xs text-text-secondary shrink-0 min-h-[36px] hover:bg-surface-3/80 active:bg-surface-3/80 transition-colors"
                >
                  <Navigation2 className="size-3.5" />
                  <span>Navigovat</span>
                </button>
              )}
            </div>

            {/* Distance */}
            <Row label="Vzdálenost" value={`${Number(job.distance) || 0} km`} mono />
          </Group>
        )}

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
          aria-expanded={accessExpanded}
          className="flex items-center justify-between rounded-2xl bg-surface-1 px-4 py-3 min-h-[44px] w-full text-left transition-colors hover:bg-surface-2 active:bg-surface-2"
        >
          <span className="text-sm font-medium text-text-secondary">Přístup</span>
          {accessExpanded ? <ChevronUp className="size-4 text-text-tertiary" /> : <ChevronDown className="size-4 text-text-tertiary" />}
        </button>

        {accessExpanded && (
          <Group>
            <Row label="Parkování" value="—" />
            <Row label="Úzký průchod" value="Ne" />
            <Row label="Vzdálenost ke vchodu" value="—" />
          </Group>
        )}

        {/* Technician notes */}
        <div className="flex flex-col gap-2">
          <SectionHeader>Poznámky technika</SectionHeader>
          <textarea
            value={techNotes}
            onChange={(e) => setTechNotes(e.target.value)}
            placeholder="Vaše poznámky k zakázce..."
            aria-label="Poznámky technika"
            className="w-full min-h-[80px] rounded-2xl bg-surface-1 px-4 py-3 text-sm transition-colors outline-none placeholder:text-text-tertiary focus-visible:ring-2 focus-visible:ring-ring/50 resize-y"
          />
        </div>
      </main>

      {/* Sticky CTA */}
      {canStartSurvey && (
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

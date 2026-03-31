"use client"

import { use, useState, useRef, useCallback, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft, ChevronDown, ChevronUp, Phone, Navigation2,
  ClipboardCheck, Loader2, MessageSquare, PhoneCall, RefreshCw,
  Clock, Send, X, Check,
} from "lucide-react"
import { NavigationSheet, useNavigationSheet } from "@/components/navigation-sheet"
import { Surface, Group, Row, Alert, ActionButton, SectionHeader } from "@/components/ds"
import { TagPill } from "@/components/tag-pill"
import {
  getStatusConfig, allowedTransitions, STATUS_CONFIG,
  type JobStatus, JOB_STATUSES,
} from "@/lib/job-status"

function useIsMounted() {
  return useSyncExternalStore(() => () => {}, () => true, () => false)
}

interface AccessData {
  parking?: "easy" | "limited" | "difficult"
  narrowPassage?: boolean
  narrowNote?: string
  entryDistance?: "short" | "medium" | "long"
}

interface JobDetail {
  id: string
  jobType: string
  status: string
  date: string | null
  time: string | null
  pickupAddress: string
  pickupFloor: number
  pickupElevator: boolean
  deliveryAddress: string
  deliveryFloor: number
  deliveryElevator: boolean
  distance: string
  access: AccessData | null
  dispatcherNote: string | null
  technicianNotes: string | null
  tags: string[] | null
  lossReason: string | null
  lossNote: string | null
  winReason: string | null
  winNote: string | null
  customer: { name: string; phone: string; email: string } | null
}

interface JobEvent {
  id: string
  type: string
  payload: Record<string, unknown> | null
  createdAt: string
}

const LOSS_REASONS = [
  { id: "price", label: "Vysoká cena" },
  { id: "competition", label: "Konkurence" },
  { id: "research", label: "Průzkum trhu" },
  { id: "postponed", label: "Odloženo" },
  { id: "no_response", label: "Nereaguje" },
  { id: "other", label: "Jiné" },
]

const WIN_REASONS = [
  { id: "price", label: "Dobrá cena" },
  { id: "speed", label: "Rychlost" },
  { id: "referral", label: "Doporučení" },
  { id: "trust", label: "Důvěra" },
  { id: "other", label: "Jiné" },
]

const EVENT_CONFIG: Record<string, { label: string; icon: typeof MessageSquare; color: string }> = {
  job_created:     { label: "Zakázka vytvořena", icon: RefreshCw, color: "text-status-new" },
  job_updated:     { label: "Zakázka upravena", icon: RefreshCw, color: "text-text-tertiary" },
  survey_saved:    { label: "Zaměření uloženo", icon: ClipboardCheck, color: "text-status-survey" },
  offer_generated: { label: "Nabídka vygenerována", icon: Send, color: "text-status-approval" },
  offer_viewed:    { label: "Nabídka zobrazena", icon: Check, color: "text-status-approval" },
  status_changed:  { label: "Stav změněn", icon: RefreshCw, color: "text-status-execution" },
  call_logged:     { label: "Hovor zaznamenán", icon: PhoneCall, color: "text-blue-400" },
  note_added:      { label: "Poznámka přidána", icon: MessageSquare, color: "text-sky-400" },
  reminder_set:    { label: "Připomínka nastavena", icon: Clock, color: "text-amber-400" },
}

export default function JobCockpitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const mounted = useIsMounted()
  const router = useRouter()
  const [job, setJob] = useState<JobDetail | null>(null)
  const [events, setEvents] = useState<JobEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [accessExpanded, setAccessExpanded] = useState(false)
  const [techNotes, setTechNotes] = useState("")
  const [notesSaved, setNotesSaved] = useState(true)
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)
  const [lossModalOpen, setLossModalOpen] = useState(false)
  const [winModalOpen, setWinModalOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<JobStatus | null>(null)
  const [reasonNote, setReasonNote] = useState("")
  const [newNote, setNewNote] = useState("")
  const [tagPickerOpen, setTagPickerOpen] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [scheduleDate, setScheduleDate] = useState("")
  const [scheduleTime, setScheduleTime] = useState("")
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { navAddress, openNav, closeNav } = useNavigationSheet()

  const saveTechNotes = useCallback((value: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setNotesSaved(false)
    saveTimer.current = setTimeout(() => {
      fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ technicianNotes: value }),
      }).then(() => setNotesSaved(true)).catch(() => {})
    }, 800)
  }, [id])

  const loadEvents = useCallback(() => {
    fetch(`/api/jobs/${id}/events`)
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [id])

  // Load from DB
  if (mounted && !loaded) {
    setLoaded(true)
    Promise.all([
      fetch(`/api/jobs/${id}`).then((r) => { if (!r.ok) throw new Error("not found"); return r.json() }),
      fetch(`/api/jobs/${id}/events`).then((r) => r.json()),
    ])
      .then(([jobData, eventsData]) => {
        setJob(jobData)
        setTechNotes(jobData.technicianNotes || "")
        setEvents(Array.isArray(eventsData) ? eventsData : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  /** Change job status with validation */
  const changeStatus = useCallback(async (to: JobStatus) => {
    setStatusMenuOpen(false)

    // If transitioning to "lost", show loss reason modal
    if (to === "lost") {
      setPendingStatus("lost")
      setLossModalOpen(true)
      return
    }
    // If transitioning to "done", show win reason modal
    if (to === "done") {
      setPendingStatus("done")
      setWinModalOpen(true)
      return
    }

    const res = await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: to }),
    })
    if (res.ok) {
      setJob((prev) => prev ? { ...prev, status: to } : prev)
      loadEvents()
    }
  }, [id, loadEvents])

  /** Confirm loss/win with reason */
  const confirmReason = useCallback(async (reason: string, type: "loss" | "win") => {
    const status = type === "loss" ? "lost" : "done"
    const body: Record<string, unknown> = { status }
    if (type === "loss") {
      body.lossReason = reason
      body.lossNote = reasonNote || null
    } else {
      body.winReason = reason
      body.winNote = reasonNote || null
    }

    const res = await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      setJob((prev) => prev ? { ...prev, status, ...(type === "loss" ? { lossReason: reason, lossNote: reasonNote } : { winReason: reason, winNote: reasonNote }) } : prev)
      loadEvents()
    }
    setLossModalOpen(false)
    setWinModalOpen(false)
    setPendingStatus(null)
    setReasonNote("")
  }, [id, reasonNote, loadEvents])

  /** Add a note via events API */
  const addNote = useCallback(async () => {
    if (!newNote.trim()) return
    await fetch(`/api/jobs/${id}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "note_added", note: newNote.trim() }),
    })
    setNewNote("")
    loadEvents()
  }, [id, newNote, loadEvents])

  /** Toggle a tag */
  const toggleTag = useCallback(async (tag: string) => {
    const current = job?.tags ?? []
    const next = current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]
    await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags: next }),
    })
    setJob((prev) => prev ? { ...prev, tags: next } : prev)
  }, [id, job?.tags])

  /** Schedule date/time */
  const saveSchedule = useCallback(async () => {
    await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: scheduleDate || null, time: scheduleTime || null }),
    })
    setJob((prev) => prev ? { ...prev, date: scheduleDate || null, time: scheduleTime || null } : prev)
    setScheduleOpen(false)
    loadEvents()
  }, [id, scheduleDate, scheduleTime, loadEvents])

  /** Log a call */
  const logCall = useCallback(async () => {
    await fetch(`/api/jobs/${id}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "call_logged" }),
    })
    loadEvents()
  }, [id, loadEvents])

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

  const statusConfig = getStatusConfig(job.status)
  const transitions = allowedTransitions(job.status as JobStatus)
  const canStartSurvey = job.status === "draft" || job.status === "survey"

  const dateFormatted = job.date
    ? new Date(job.date).toLocaleDateString("cs-CZ", { weekday: "short", day: "numeric", month: "long" })
    : "—"

  const floorInfo = (floor: number, elevator: boolean) =>
    `${floor}. patro${elevator ? " s výtahem" : " bez výtahu"}`

  return (
    <div className="flex flex-1 flex-col ios-slide-in">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface-0/80 backdrop-blur-xl px-4 py-2.5">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => router.push("/jobs")} aria-label="Zpět"
            className="flex items-center justify-center size-9 -ml-1 rounded-lg text-text-secondary hover:bg-surface-2 active:bg-surface-2 transition-colors">
            <ChevronLeft className="size-5" />
          </button>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-semibold truncate">{job.customer?.name || "Nový klient"}</span>
            <span className="text-[11px] text-text-tertiary truncate">
              {(job.pickupAddress || "—").split(",")[0]} → {(job.deliveryAddress || "—").split(",")[0]}
            </span>
          </div>
          {/* Status badge — tappable */}
          <div className="relative">
            <button type="button" onClick={() => setStatusMenuOpen((p) => !p)}
              className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg bg-surface-2 ${statusConfig.color} min-h-[32px] transition-colors`}>
              {statusConfig.label}
              <ChevronDown className="size-3" />
            </button>
            {/* Status dropdown */}
            {statusMenuOpen && transitions.length > 0 && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-surface-1 border border-border rounded-xl shadow-xl overflow-hidden min-w-[160px]">
                {transitions.map((to) => {
                  const toConfig = STATUS_CONFIG[to]
                  return (
                    <button key={to} type="button" onClick={() => changeStatus(to)}
                      className={`flex items-center gap-2 w-full px-3 py-2.5 text-sm text-left hover:bg-surface-2 transition-colors min-h-[44px] ${toConfig.color}`}>
                      <span className={`size-2 rounded-full ${toConfig.dotColor}`} />
                      {toConfig.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 px-4 py-4 pb-40 overflow-y-auto">
        {/* Quick actions bar */}
        <div className="flex items-center gap-2">
          {job.customer?.phone && (
            <a href={`tel:${job.customer.phone.replace(/\s/g, "")}`} onClick={logCall}
              className="flex items-center gap-1.5 rounded-xl bg-success/15 text-success px-3 py-2 text-xs font-medium hover:bg-success/25 transition-colors min-h-[36px]">
              <Phone className="size-3.5" />
              Zavolat
            </a>
          )}
          {job.pickupAddress && (
            <button type="button" onClick={() => openNav(job.pickupAddress)}
              className="flex items-center gap-1.5 rounded-xl bg-surface-2 px-3 py-2 text-xs text-text-secondary hover:bg-surface-3 transition-colors min-h-[36px]">
              <Navigation2 className="size-3.5" />
              Navigovat
            </button>
          )}
          {canStartSurvey && (
            <button type="button" onClick={() => router.push(`/jobs/${id}/survey`)}
              className="flex items-center gap-1.5 rounded-xl bg-status-survey/15 text-status-survey px-3 py-2 text-xs font-medium hover:bg-status-survey/25 transition-colors min-h-[36px]">
              <ClipboardCheck className="size-3.5" />
              Zaměření
            </button>
          )}
          <button type="button" onClick={() => { setScheduleDate(job.date || ""); setScheduleTime(""); setScheduleOpen(true) }}
            className="flex items-center gap-1.5 rounded-xl bg-surface-2 px-3 py-2 text-xs text-text-secondary hover:bg-surface-3 transition-colors min-h-[36px]">
            <Clock className="size-3.5" />
            Naplánovat
          </button>
        </div>

        {/* Tags — editable */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(job.tags ?? []).map((tag) => (
            <button key={tag} type="button" onClick={() => toggleTag(tag)} className="group">
              <TagPill tag={tag} size="sm" />
            </button>
          ))}
          <button type="button" onClick={() => setTagPickerOpen((p) => !p)}
            className="flex items-center gap-1 text-[11px] text-text-tertiary px-2 py-0.5 rounded-md border border-dashed border-border hover:bg-surface-2 transition-colors min-h-[24px]">
            + tag
          </button>
        </div>
        {tagPickerOpen && (
          <div className="flex flex-wrap gap-1.5 rounded-xl bg-surface-1 p-3">
            {["high", "medium", "low", "byt", "dům", "kancelář", "sklad", "web", "call", "referral", "volat", "napsat", "naplánovat"].map((tag) => {
              const active = (job.tags ?? []).includes(tag)
              return (
                <button key={tag} type="button" onClick={() => toggleTag(tag)}
                  className={`text-[11px] px-2 py-1 rounded-md border font-medium transition-colors min-h-[32px] ${active ? "bg-success/15 text-success border-success/30" : "bg-surface-2 text-text-secondary border-border hover:bg-surface-3"}`}>
                  {active ? "✓ " : ""}{tag}
                </button>
              )
            })}
          </div>
        )}

        {/* Client + date card */}
        <Surface className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-base font-semibold">{job.customer?.name || "Nový klient"}</span>
              <span className="text-xs text-text-secondary">{dateFormatted}</span>
              {job.customer?.phone && (
                <span className="text-xs text-text-tertiary mt-0.5">{job.customer.phone}</span>
              )}
            </div>
          </div>
        </Surface>

        {/* Route */}
        {(job.pickupAddress || job.deliveryAddress) && (
          <Group>
            <div className="flex items-center justify-between gap-2 px-4 py-3 min-h-[44px]">
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-text-tertiary">Nakládka</span>
                <span className="text-sm truncate">{job.pickupAddress || "—"}</span>
                <span className="text-xs text-text-tertiary">{floorInfo(job.pickupFloor, job.pickupElevator)}</span>
              </div>
              {job.pickupAddress && (
                <button type="button" onClick={() => openNav(job.pickupAddress)}
                  className="flex items-center gap-1 rounded-lg bg-surface-3 px-2.5 py-1.5 text-xs text-text-secondary shrink-0 min-h-[36px] hover:bg-surface-3/80 transition-colors">
                  <Navigation2 className="size-3.5" />
                  <span>Nav</span>
                </button>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 px-4 py-3 min-h-[44px]">
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-text-tertiary">Vykládka</span>
                <span className="text-sm truncate">{job.deliveryAddress || "—"}</span>
                <span className="text-xs text-text-tertiary">{floorInfo(job.deliveryFloor, job.deliveryElevator)}</span>
              </div>
              {job.deliveryAddress && (
                <button type="button" onClick={() => openNav(job.deliveryAddress)}
                  className="flex items-center gap-1 rounded-lg bg-surface-3 px-2.5 py-1.5 text-xs text-text-secondary shrink-0 min-h-[36px] hover:bg-surface-3/80 transition-colors">
                  <Navigation2 className="size-3.5" />
                  <span>Nav</span>
                </button>
              )}
            </div>
            <Row label="Vzdálenost" value={`${Number(job.distance) || 0} km`} mono />
            {Number(job.distance) > 0 && (
              <Row label="Čas jízdy" value={`~${Math.round(Number(job.distance) * 0.02 * 1.3 * 60)} min`} mono />
            )}
          </Group>
        )}

        {/* Dispatcher note */}
        {job.dispatcherNote && (
          <Alert variant="warning" title="Poznámka dispečinku">
            {job.dispatcherNote}
          </Alert>
        )}

        {/* Access — collapsible */}
        {job.access && (job.access.parking || job.access.narrowPassage || job.access.entryDistance) && (
          <>
            <button type="button" onClick={() => setAccessExpanded((prev) => !prev)} aria-expanded={accessExpanded}
              className="flex items-center justify-between rounded-2xl bg-surface-1 px-4 py-3 min-h-[44px] w-full text-left transition-colors hover:bg-surface-2">
              <span className="text-sm font-medium text-text-secondary">Přístup</span>
              {accessExpanded ? <ChevronUp className="size-4 text-text-tertiary" /> : <ChevronDown className="size-4 text-text-tertiary" />}
            </button>
            {accessExpanded && (
              <Group>
                {job.access.parking && <Row label="Parkování" value={{ easy: "Snadné", limited: "Omezené", difficult: "Obtížné" }[job.access.parking]} />}
                {job.access.narrowPassage && <Row label="Úzký průchod" value={job.access.narrowNote || "Ano"} />}
                {job.access.entryDistance && <Row label="Ke vchodu" value={{ short: "Krátká", medium: "Střední", long: "Dlouhá" }[job.access.entryDistance]} />}
              </Group>
            )}
          </>
        )}

        {/* Technician notes */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <SectionHeader>Poznámky technika</SectionHeader>
            <span className="text-[10px] text-text-tertiary">{notesSaved ? "Uloženo" : "Ukládám..."}</span>
          </div>
          <textarea
            value={techNotes}
            onChange={(e) => { setTechNotes(e.target.value); saveTechNotes(e.target.value) }}
            placeholder="Vaše poznámky k zakázce..."
            aria-label="Poznámky technika"
            className="w-full min-h-[80px] rounded-2xl bg-surface-1 px-4 py-3 text-sm transition-colors outline-none placeholder:text-text-tertiary focus-visible:ring-2 focus-visible:ring-ring/50 resize-y"
          />
        </div>

        {/* CRM Timeline */}
        {events.length > 0 && (
          <div className="flex flex-col gap-2">
            <SectionHeader>Timeline · {events.length}</SectionHeader>
            <div className="flex flex-col gap-1">
              {events.map((event) => {
                const cfg = EVENT_CONFIG[event.type] ?? { label: event.type, icon: RefreshCw, color: "text-text-tertiary" }
                const Icon = cfg.icon
                const time = new Date(event.createdAt).toLocaleString("cs-CZ", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" })
                const payload = event.payload as Record<string, unknown> | null

                let detail = ""
                if (event.type === "status_changed" && payload) {
                  const from = getStatusConfig(payload.from as string)
                  const to = getStatusConfig(payload.to as string)
                  detail = `${from.label} → ${to.label}`
                }
                if (event.type === "note_added" && payload?.note) {
                  detail = String(payload.note)
                }

                return (
                  <div key={event.id} className="flex items-start gap-3 rounded-xl bg-surface-1 px-3 py-2.5">
                    <div className={`flex items-center justify-center size-7 rounded-full bg-surface-2 shrink-0 mt-0.5 ${cfg.color}`}>
                      <Icon className="size-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                        <span className="text-[10px] text-text-tertiary font-mono">{time}</span>
                      </div>
                      {detail && <p className="text-xs text-text-secondary mt-0.5">{detail}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* Sticky bottom panel — quick note + actions */}
      <div className="sticky bottom-0 z-40 border-t border-border bg-surface-0/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
        <div className="px-4 py-3 flex flex-col gap-2">
          {/* Quick note input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addNote() }}
              placeholder="Přidat poznámku..."
              className="flex-1 h-10 rounded-xl bg-surface-1 px-3 text-sm outline-none placeholder:text-text-tertiary focus-visible:ring-2 focus-visible:ring-ring/50"
            />
            <button type="button" onClick={addNote} disabled={!newNote.trim()}
              className="flex items-center justify-center size-10 rounded-xl bg-success text-success-foreground disabled:opacity-30 transition-opacity min-h-[44px]">
              <Send className="size-4" />
            </button>
          </div>

          {/* Survey CTA when applicable */}
          {canStartSurvey && (
            <ActionButton onClick={() => router.push(`/jobs/${id}/survey`)}>
              <ClipboardCheck className="size-5" />
              Zahájit zaměření
            </ActionButton>
          )}
        </div>
      </div>

      {/* Loss reason modal */}
      {lossModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => { setLossModalOpen(false); setPendingStatus(null) }}>
          <div className="w-full max-w-lg bg-surface-1 rounded-t-2xl pb-[env(safe-area-inset-bottom)] ios-sheet-up" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <h3 className="text-base font-semibold">Důvod ztráty</h3>
              <button type="button" onClick={() => { setLossModalOpen(false); setPendingStatus(null) }}
                className="flex items-center justify-center size-8 rounded-lg hover:bg-surface-2 transition-colors">
                <X className="size-4 text-text-tertiary" />
              </button>
            </div>
            <div className="flex flex-col gap-1 px-4">
              {LOSS_REASONS.map((r) => (
                <button key={r.id} type="button" onClick={() => confirmReason(r.id, "loss")}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-left hover:bg-surface-2 transition-colors min-h-[44px]">
                  <span className="size-2 rounded-full bg-status-lost" />
                  {r.label}
                </button>
              ))}
            </div>
            <div className="px-4 py-3">
              <input
                type="text"
                value={reasonNote}
                onChange={(e) => setReasonNote(e.target.value)}
                placeholder="Volitelná poznámka..."
                className="w-full h-10 rounded-xl bg-surface-2 px-3 text-sm outline-none placeholder:text-text-tertiary"
              />
            </div>
          </div>
        </div>
      )}

      {/* Win reason modal */}
      {winModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => { setWinModalOpen(false); setPendingStatus(null) }}>
          <div className="w-full max-w-lg bg-surface-1 rounded-t-2xl pb-[env(safe-area-inset-bottom)] ios-sheet-up" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <h3 className="text-base font-semibold">Důvod výhry</h3>
              <button type="button" onClick={() => { setWinModalOpen(false); setPendingStatus(null) }}
                className="flex items-center justify-center size-8 rounded-lg hover:bg-surface-2 transition-colors">
                <X className="size-4 text-text-tertiary" />
              </button>
            </div>
            <div className="flex flex-col gap-1 px-4">
              {WIN_REASONS.map((r) => (
                <button key={r.id} type="button" onClick={() => confirmReason(r.id, "win")}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-left hover:bg-surface-2 transition-colors min-h-[44px]">
                  <span className="size-2 rounded-full bg-status-new" />
                  {r.label}
                </button>
              ))}
            </div>
            <div className="px-4 py-3">
              <input
                type="text"
                value={reasonNote}
                onChange={(e) => setReasonNote(e.target.value)}
                placeholder="Volitelná poznámka..."
                className="w-full h-10 rounded-xl bg-surface-2 px-3 text-sm outline-none placeholder:text-text-tertiary"
              />
            </div>
          </div>
        </div>
      )}

      {/* Schedule modal */}
      {scheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setScheduleOpen(false)}>
          <div className="w-full max-w-lg bg-surface-1 rounded-t-2xl pb-[env(safe-area-inset-bottom)] ios-sheet-up" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <h3 className="text-base font-semibold">Naplánovat</h3>
              <button type="button" onClick={() => setScheduleOpen(false)}
                className="flex items-center justify-center size-8 rounded-lg hover:bg-surface-2 transition-colors">
                <X className="size-4 text-text-tertiary" />
              </button>
            </div>
            <div className="flex flex-col gap-3 px-4 py-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-text-tertiary">Datum</label>
                <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)}
                  className="h-11 rounded-xl bg-surface-2 px-3 text-sm outline-none" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-text-tertiary">Čas</label>
                <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)}
                  className="h-11 rounded-xl bg-surface-2 px-3 text-sm outline-none" />
              </div>
              <button type="button" onClick={saveSchedule}
                className="h-12 rounded-xl bg-success text-success-foreground text-sm font-medium hover:bg-success/90 transition-colors">
                Uložit
              </button>
            </div>
          </div>
        </div>
      )}

      {navAddress && <NavigationSheet address={navAddress} onClose={closeNav} />}
    </div>
  )
}

"use client"

import { useState, useCallback, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, Loader2, Plus, Phone, Navigation2 } from "lucide-react"

function useIsMounted() {
  return useSyncExternalStore(() => () => {}, () => true, () => false)
}

interface DbJob {
  id: string
  jobType: string
  status: string
  date: string | null
  time: string | null
  pickupAddress: string
  deliveryAddress: string
  pickupFloor: number
  pickupElevator: boolean
  deliveryFloor: number
  deliveryElevator: boolean
  distance: string
  dispatcherNote: string | null
  createdAt: string
  customerName: string | null
  customerPhone: string | null
  customerEmail: string | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string; borderColor: string }> = {
  draft: { label: "Koncept", color: "text-text-tertiary", borderColor: "border-l-zinc-400" },
  survey: { label: "Zaměření", color: "text-status-survey", borderColor: "border-l-status-survey" },
  offer: { label: "Nabídka", color: "text-status-approval", borderColor: "border-l-status-approval" },
  approved: { label: "Schváleno", color: "text-status-execution", borderColor: "border-l-status-execution" },
  execution: { label: "Realizace", color: "text-status-execution", borderColor: "border-l-status-execution" },
  invoicing: { label: "Fakturace", color: "text-status-invoicing", borderColor: "border-l-status-invoicing" },
  done: { label: "Hotovo", color: "text-text-tertiary", borderColor: "border-l-zinc-400" },
}

function getTodayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function getWeekDays(todayStr: string, offset: number) {
  const [y, m, d] = todayStr.split("-").map(Number)
  const baseDay = offset * 7
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(y, m - 1, d + baseDay + i, 12)
    const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`
    return { date: dateStr, dayNum: day.getDate(), dayName: day.toLocaleDateString("cs-CZ", { weekday: "short" }).toUpperCase(), isToday: dateStr === todayStr }
  })
}

function timeOfDay(time: string | null): string {
  if (!time) return ""
  const hour = parseInt(time.split(":")[0], 10)
  return hour < 12 ? "DOP." : "ODP."
}

function sortByTime(a: DbJob, b: DbJob): number {
  if (a.time && b.time) return a.time.localeCompare(b.time)
  if (a.time) return -1
  if (b.time) return 1
  return 0
}

function floorInfo(floor: number, elevator: boolean): string {
  if (floor === 0) return "přízemí"
  return `${floor}. p.${elevator ? " výtah" : ""}`
}

export default function CalendarPage() {
  const mounted = useIsMounted()
  const router = useRouter()
  const TODAY = getTodayStr()
  const [selectedDate, setSelectedDate] = useState(TODAY)
  const [weekOffset, setWeekOffset] = useState(0)
  const [jobs, setJobs] = useState<DbJob[]>([])
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)

  if (mounted && !loaded) {
    setLoaded(true)
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((data) => { setJobs(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  if (!mounted || loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-text-tertiary" />
      </div>
    )
  }

  const weekDays = getWeekDays(TODAY, weekOffset)
  const isToday = selectedDate === TODAY
  const selectedFormatted = new Date(selectedDate + "T12:00:00").toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" })

  const dayJobs = jobs.filter((j) => j.date === selectedDate).sort(sortByTime)

  function getDateDots(date: string): string[] {
    const dateJobs = jobs.filter((j) => j.date === date)
    const dots: string[] = []
    if (dateJobs.some((j) => j.status === "draft" || j.status === "survey")) dots.push("bg-status-survey")
    if (dateJobs.some((j) => j.status === "execution")) dots.push("bg-status-execution")
    if (dateJobs.some((j) => j.status === "offer" || j.status === "approved")) dots.push("bg-status-approval")
    return dots
  }

  return (
    <div className="flex flex-1 flex-col ios-fade-in">
      {/* Header */}
      <header className="bg-surface-0 px-4 pt-4 pb-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Kalendář</h1>
            <p className="text-sm text-text-tertiary mt-0.5 capitalize">{selectedFormatted}</p>
          </div>
          {!isToday && (
            <button type="button" onClick={() => { setSelectedDate(TODAY); setWeekOffset(0) }}
              className="text-sm text-success font-medium px-3 py-1.5 rounded-lg hover:bg-success/10 transition-colors min-h-[44px]">
              Dnes
            </button>
          )}
        </div>
      </header>

      {/* Week strip */}
      <div className="flex items-center gap-0.5 px-4 py-3" role="tablist" aria-label="Výběr dne">
        {/* Prev week */}
        <button type="button" onClick={() => setWeekOffset((p) => p - 1)} aria-label="Předchozí týden"
          className="flex items-center justify-center size-8 rounded-lg text-text-tertiary hover:bg-surface-2 transition-colors shrink-0">
          ‹
        </button>
        {weekDays.map((day) => {
          const isSelected = day.date === selectedDate
          const dots = getDateDots(day.date)
          return (
            <button
              key={day.date}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-label={`${day.dayName} ${day.dayNum}`}
              onClick={() => setSelectedDate(day.date)}
              className={`flex flex-col items-center gap-0.5 flex-1 py-2 rounded-xl transition-colors ${
                isSelected ? "text-text-primary bg-surface-1" : day.isToday ? "text-success" : "text-text-tertiary"
              }`}
            >
              <span className="text-[10px] tracking-wide">{day.dayName}</span>
              <span className={`text-lg ${isSelected ? "font-bold" : "font-medium"}`}>{day.dayNum}</span>
              {isSelected && <span className="w-5 h-0.5 rounded-full bg-success mt-0.5" />}
              {!isSelected && (
                <div className="flex items-center gap-0.5 h-1.5 mt-0.5">
                  {dots.map((dotColor, i) => (
                    <span key={i} className={`size-1 rounded-full ${dotColor}`} />
                  ))}
                </div>
              )}
            </button>
          )
        })}
        {/* Next week */}
        <button type="button" onClick={() => setWeekOffset((p) => p + 1)} aria-label="Další týden"
          className="flex items-center justify-center size-8 rounded-lg text-text-tertiary hover:bg-surface-2 transition-colors shrink-0">
          ›
        </button>
      </div>

      {/* Day schedule */}
      <main className="flex flex-1 flex-col gap-2 px-4 pb-6 overflow-y-auto">
        {dayJobs.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-sm text-text-secondary">
              {isToday ? "Na dnes nemáte nic naplánováno." : "Na tento den nemáte nic."}
            </p>
            <button type="button" onClick={() => { /* handled by command center */ }}
              className="flex items-center gap-1.5 rounded-xl bg-success text-success-foreground px-4 py-2.5 text-sm font-medium hover:bg-success/90 transition-colors min-h-[44px]">
              <Plus className="size-4" />
              Nová zakázka
            </button>
          </div>
        ) : (
          dayJobs.map((job, i) => {
            const config = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.draft
            const prevJob = i > 0 ? dayJobs[i - 1] : null

            // Time gap indicator
            let gapMinutes = 0
            if (prevJob?.time && job.time) {
              const [ph, pm] = prevJob.time.split(":").map(Number)
              const [h, m] = job.time.split(":").map(Number)
              gapMinutes = (h * 60 + m) - (ph * 60 + pm)
            }

            return (
              <div key={job.id}>
                {gapMinutes > 60 && (
                  <div className="flex items-center gap-3 py-2">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[10px] text-text-tertiary">{Math.floor(gapMinutes / 60)} h volno</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => router.push(`/jobs/${job.id}`)}
                  aria-label={`${job.time || ""} ${job.customerName || "Nový klient"}, ${config.label}`}
                  className={`flex w-full text-left rounded-2xl bg-surface-1 overflow-hidden transition-colors hover:bg-surface-2 active:bg-surface-2 border-l-[2px] ${config.borderColor}`}
                >
                  {/* Time column */}
                  <div className="flex flex-col items-center justify-center w-[68px] shrink-0 py-4">
                    <span className="text-base font-mono font-bold">{job.time || "—"}</span>
                    <span className="text-[9px] text-text-tertiary tracking-wider">{timeOfDay(job.time)}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-semibold truncate">{job.customerName || "Nový klient"}</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-surface-2 ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <span className="text-xs text-text-secondary truncate block mt-0.5">
                      {(job.pickupAddress || "—").split(",")[0]} → {(job.deliveryAddress || "—").split(",")[0]}
                    </span>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-text-tertiary">
                      <span>{floorInfo(job.pickupFloor, job.pickupElevator)}</span>
                      <span>→</span>
                      <span>{floorInfo(job.deliveryFloor, job.deliveryElevator)}</span>
                      <span>·</span>
                      <span className="font-mono">{Number(job.distance) || 0} km</span>
                    </div>
                  </div>

                  <div className="flex items-center pr-3 shrink-0">
                    <ChevronRight className="size-4 text-text-tertiary" />
                  </div>
                </button>
              </div>
            )
          })
        )}
      </main>

    </div>
  )
}

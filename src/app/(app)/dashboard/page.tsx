"use client"

import { useState, useCallback, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, Loader2, AlertCircle, FileText, Plus, Phone, Navigation2 } from "lucide-react"

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

const ATTENTION_ICON: Record<string, typeof AlertCircle> = {
  offer: AlertCircle,
  invoicing: FileText,
}

function getTodayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function needsAction(job: DbJob): boolean {
  return job.status === "draft" || job.status === "survey"
}

function needsAttention(job: DbJob): boolean {
  return job.status === "offer" || job.status === "invoicing"
}

export default function DashboardPage() {
  const mounted = useIsMounted()
  const router = useRouter()
  const TODAY = getTodayStr()
  const [jobs, setJobs] = useState<DbJob[]>([])
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)

  const openJob = useCallback((job: DbJob) => { router.push(`/jobs/${job.id}`) }, [router])

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

  const todayFormatted = new Date(TODAY + "T12:00:00").toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()

  // Today's jobs sorted by time
  const todayJobs = jobs
    .filter((j) => j.date === TODAY)
    .sort((a, b) => {
      if (a.time && b.time) return a.time.localeCompare(b.time)
      if (a.time) return -1
      if (b.time) return 1
      return 0
    })

  // Next job = first today's job that hasn't been completed
  const nextJob = todayJobs.find((j) => j.status !== "done" && j.status !== "invoicing") || null
  const remainingTodayJobs = todayJobs.filter((j) => j !== nextJob)

  const daySurveys = todayJobs.filter((j) => j.status === "draft" || j.status === "survey").length
  const dayExecutions = todayJobs.filter((j) => j.status === "execution").length

  const actionJobs = jobs.filter(needsAction)
  const attentionJobs = jobs.filter(needsAttention)

  return (
    <div className="flex flex-1 flex-col ios-fade-in">
      {/* Header */}
      <header className="bg-surface-0 px-4 pt-5 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] text-text-tertiary tracking-widest">{todayFormatted}</p>
            <h1 className="text-[26px] font-bold tracking-tight mt-1">
              Dobrý den, <em className="not-italic text-text-secondary">Jan</em>
            </h1>
            {todayJobs.length > 0 && (
              <div className="flex items-center gap-3 mt-1">
                {daySurveys > 0 && (
                  <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <span className="size-2 rounded-full bg-status-survey" />{daySurveys}× zaměření
                  </span>
                )}
                {dayExecutions > 0 && (
                  <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <span className="size-2 rounded-full bg-status-execution" />{dayExecutions}× stěhování
                  </span>
                )}
              </div>
            )}
          </div>
          <button type="button" onClick={() => router.push("/profile")} aria-label="Profil"
            className="flex items-center justify-center size-11 rounded-full bg-surface-2 text-text-secondary text-sm font-semibold shrink-0 mt-1 hover:bg-surface-3 transition-colors">
            JT
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-5 px-4 pb-6 overflow-y-auto">
        {/* Další v programu — prominent next job card */}
        {nextJob && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-text-tertiary tracking-widest uppercase">Další v programu</span>
              <button type="button" onClick={() => router.push("/calendar")} className="text-[11px] text-success flex items-center gap-0.5 hover:text-success/80 transition-colors">
                kalendář <ChevronRight className="size-3" />
              </button>
            </div>
            <button type="button" onClick={() => openJob(nextJob)}
              className={`flex flex-col w-full text-left rounded-2xl bg-surface-1 overflow-hidden transition-colors hover:bg-surface-2 active:bg-surface-2 border-l-[4px] ${(STATUS_CONFIG[nextJob.status] ?? STATUS_CONFIG.draft).borderColor}`}>
              <div className="px-4 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  {nextJob.time && <span className="text-lg font-mono font-bold">{nextJob.time}</span>}
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-surface-2 ${(STATUS_CONFIG[nextJob.status] ?? STATUS_CONFIG.draft).color}`}>
                    {(STATUS_CONFIG[nextJob.status] ?? STATUS_CONFIG.draft).label}
                  </span>
                </div>
                <span className="text-base font-semibold block mt-1">{nextJob.customerName || "Nový klient"}</span>
                {(nextJob.pickupAddress || nextJob.deliveryAddress) && (
                  <span className="text-sm text-text-secondary block mt-0.5">
                    {(nextJob.pickupAddress || "—").split(",")[0]} → {(nextJob.deliveryAddress || "—").split(",")[0]}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 px-4 pb-4 pt-1">
                {nextJob.pickupAddress && (
                  <span onClick={(e) => { e.stopPropagation(); window.open(`https://maps.google.com/?q=${encodeURIComponent(nextJob.pickupAddress)}`, "_blank") }}
                    className="flex items-center gap-1.5 rounded-xl bg-surface-2 px-3 py-2 text-xs text-text-secondary hover:bg-surface-3 transition-colors min-h-[36px]">
                    <Navigation2 className="size-3.5" />
                    Navigovat
                  </span>
                )}
                {nextJob.customerPhone && (
                  <a href={`tel:${nextJob.customerPhone.replace(/\s/g, "")}`} onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 rounded-xl bg-success/15 text-success px-3 py-2 text-xs font-medium hover:bg-success/25 transition-colors min-h-[36px]">
                    <Phone className="size-3.5" />
                    Zavolat
                  </a>
                )}
              </div>
            </button>
          </div>
        )}

        {/* Zbytek dne */}
        {remainingTodayJobs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-text-tertiary tracking-widest uppercase">Dnes ještě</span>
            </div>
            <div className="flex flex-col gap-2">
              {remainingTodayJobs.map((job) => {
                const config = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.draft
                return (
                  <button key={job.id} type="button" onClick={() => openJob(job)}
                    className={`flex items-stretch w-full text-left rounded-2xl bg-surface-1 overflow-hidden transition-colors hover:bg-surface-2 active:bg-surface-2 border-l-[3px] ${config.borderColor}`}>
                    {job.time && (
                      <div className="flex items-center justify-center w-[60px] shrink-0">
                        <span className="text-sm font-mono font-bold">{job.time}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate">{job.customerName || "Nový klient"}</span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-surface-2 ${config.color}`}>{config.label}</span>
                      </div>
                      {(job.pickupAddress || job.deliveryAddress) && (
                        <span className="text-xs text-text-secondary truncate block mt-0.5">
                          {(job.pickupAddress || "—").split(",")[0]} → {(job.deliveryAddress || "—").split(",")[0]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center pr-3 shrink-0">
                      <ChevronRight className="size-4 text-text-tertiary" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Žádné akce na dnes */}
        {todayJobs.length === 0 && jobs.length > 0 && (
          <div className="rounded-2xl bg-surface-1 px-4 py-10 text-center">
            <p className="text-sm text-text-secondary">Žádné akce na dnes.</p>
            <button type="button" onClick={() => router.push("/calendar")}
              className="text-sm text-success mt-2 hover:text-success/80 transition-colors">
              Zobrazit kalendář →
            </button>
          </div>
        )}

        {/* Vyžaduje akci */}
        {actionJobs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-text-tertiary tracking-widest uppercase">Vyžaduje akci · {actionJobs.length}</span>
              <button type="button" onClick={() => router.push("/jobs")} className="text-[11px] text-success flex items-center gap-0.5 hover:text-success/80 transition-colors">
                vše <ChevronRight className="size-3" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {actionJobs.slice(0, 3).map((job) => {
                const config = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.draft
                const dateFormatted = job.date
                  ? new Date(job.date + "T12:00:00").toLocaleDateString("cs-CZ", { weekday: "short", day: "numeric", month: "numeric" })
                  : null
                return (
                  <button key={job.id} type="button" onClick={() => openJob(job)}
                    className={`flex items-stretch w-full text-left rounded-2xl bg-surface-1 overflow-hidden transition-colors hover:bg-surface-2 active:bg-surface-2 border-l-[3px] ${config.borderColor}`}>
                    <div className="flex-1 min-w-0 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate">{job.customerName || "Nový klient"}</span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-surface-2 ${config.color}`}>{config.label}</span>
                      </div>
                      {(job.pickupAddress || job.deliveryAddress) && (
                        <span className="text-xs text-text-secondary truncate block mt-0.5">
                          {(job.pickupAddress || "—").split(",")[0]} → {(job.deliveryAddress || "—").split(",")[0]}
                        </span>
                      )}
                      {dateFormatted && <span className="text-[11px] font-mono text-text-tertiary mt-1 block">{dateFormatted}</span>}
                    </div>
                    <div className="flex items-center pr-3 shrink-0">
                      <ChevronRight className="size-4 text-text-tertiary" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Čeká na odpověď */}
        {attentionJobs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-text-tertiary tracking-widest uppercase">Čeká na odpověď</span>
              <button type="button" onClick={() => router.push("/jobs")} className="text-[11px] text-success flex items-center gap-0.5 hover:text-success/80 transition-colors">
                vše <ChevronRight className="size-3" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {attentionJobs.slice(0, 3).map((job) => {
                const config = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.offer
                const AttnIcon = ATTENTION_ICON[job.status] ?? AlertCircle
                return (
                  <button key={job.id} type="button" onClick={() => openJob(job)}
                    className={`flex items-center gap-3 rounded-2xl bg-surface-1 px-4 py-3.5 w-full text-left transition-colors hover:bg-surface-2 active:bg-surface-2 border-l-[3px] ${config.borderColor}`}>
                    <div className={`flex items-center justify-center size-9 rounded-full ${config.color} bg-surface-2 shrink-0`}>
                      <AttnIcon className={`size-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold">{job.customerName || "Nový klient"}</span>
                      {(job.pickupAddress || job.deliveryAddress) && (
                        <span className="text-xs text-text-tertiary block mt-0.5">
                          {(job.pickupAddress || "—").split(",")[0]} → {(job.deliveryAddress || "—").split(",")[0]}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="size-4 text-text-tertiary shrink-0" />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {jobs.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-lg text-text-secondary">Zatím žádné zakázky</p>
            <p className="text-sm text-text-tertiary">Vytvořte první zakázku a začněte zaměření.</p>
            <button type="button" onClick={() => router.push("/calendar")}
              className="flex items-center gap-1.5 rounded-xl bg-success text-success-foreground px-4 py-2.5 text-sm font-medium hover:bg-success/90 transition-colors min-h-[44px]">
              <Plus className="size-4" />
              Vytvořit zakázku
            </button>
          </div>
        )}
      </main>

    </div>
  )
}

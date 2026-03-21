"use client"

import { useState, useCallback, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, CheckCircle2, XCircle, MessageSquare, RefreshCw, MessageCircle, Sparkles, AlertCircle, FileText } from "lucide-react"
import { MOCK_JOBS, MOCK_NOTIFICATIONS, TODAY } from "@/lib/mock-data"
import type { MockJob, MockNotification } from "@/lib/mock-data"

function useIsMounted() {
  return useSyncExternalStore(() => () => {}, () => true, () => false)
}

const STATUS_CONFIG: Record<string, { label: string; color: string; borderColor: string }> = {
  survey: { label: "Zaměření", color: "text-status-survey", borderColor: "border-l-status-survey" },
  execution: { label: "Stěhování", color: "text-status-execution", borderColor: "border-l-status-execution" },
  approval: { label: "Schválení", color: "text-status-approval", borderColor: "border-l-status-approval" },
  invoicing: { label: "Fakturace", color: "text-status-invoicing", borderColor: "border-l-status-invoicing" },
}

const NOTIF_ICON: Record<MockNotification["type"], typeof CheckCircle2> = {
  approval: CheckCircle2, rejection: XCircle, message: MessageSquare, change: RefreshCw, comment: MessageCircle,
}
const NOTIF_COLOR: Record<MockNotification["type"], string> = {
  approval: "text-status-execution", rejection: "text-status-notification", message: "text-status-survey", change: "text-status-approval", comment: "text-status-invoicing",
}

const ATTENTION_ICON: Record<string, typeof AlertCircle> = {
  approval: AlertCircle,
  invoicing: FileText,
}

function getWeekDays(todayStr: string) {
  const today = new Date(todayStr)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const dateStr = d.toISOString().split("T")[0]
    return { date: dateStr, dayNum: d.getDate(), dayName: d.toLocaleDateString("cs-CZ", { weekday: "short" }).toUpperCase(), isToday: dateStr === todayStr }
  })
}

function getJobsForDate(date: string): MockJob[] {
  return MOCK_JOBS.filter((j) => j.date === date)
}

function getDateDots(date: string): string[] {
  const jobs = getJobsForDate(date)
  const dots: string[] = []
  if (jobs.some((j) => j.status === "survey")) dots.push("bg-status-survey")
  if (jobs.some((j) => j.status === "execution")) dots.push("bg-status-execution")
  return dots
}

function timeOfDay(time: string | undefined): string {
  if (!time) return ""
  const hour = parseInt(time.split(":")[0], 10)
  return hour < 12 ? "DOP." : "ODP."
}

export default function DashboardPage() {
  const mounted = useIsMounted()
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(TODAY)

  const openJob = useCallback((job: MockJob) => { router.push(`/jobs/${job.id}`) }, [router])

  if (!mounted) return null

  const weekDays = getWeekDays(TODAY)
  const dayJobs = getJobsForDate(selectedDate)
  const attentionJobs = MOCK_JOBS.filter((j) => j.status === "approval" || j.status === "invoicing")
  const unreadNotifications = MOCK_NOTIFICATIONS.filter((n) => !n.read)
  const daySurveys = dayJobs.filter((j) => j.status === "survey").length
  const dayExecutions = dayJobs.filter((j) => j.status === "execution").length
  const isToday = selectedDate === TODAY
  const selectedFormatted = new Date(selectedDate).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()

  return (
    <div className="flex flex-1 flex-col ios-fade-in">
      {/* Header */}
      <header className="bg-surface-0 px-4 pt-5 pb-1">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] text-text-tertiary tracking-widest">{selectedFormatted}</p>
            <h1 className="text-[26px] font-bold tracking-tight mt-1">
              {isToday ? <>Dobrý den, <em className="not-italic text-text-secondary">Jan</em></> : `Program`}
            </h1>
            {isToday && dayJobs.length > 0 && (
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
          <button
            type="button"
            onClick={() => router.push("/profile")}
            aria-label="Profil"
            className="flex items-center justify-center size-11 rounded-full bg-surface-2 text-text-secondary text-sm font-semibold shrink-0 mt-1 hover:bg-surface-3 transition-colors"
          >
            JT
          </button>
        </div>
      </header>

      {/* Day picker */}
      <div className="flex items-center gap-0.5 px-4 py-3" role="tablist" aria-label="Výběr dne">
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
                isSelected ? "text-text-primary bg-surface-1" : "text-text-tertiary"
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
      </div>

      <main className="flex flex-1 flex-col gap-5 px-4 pb-6 overflow-y-auto">
        {/* Nové podněty */}
        {isToday && unreadNotifications.length > 0 && (
          <div className="rounded-2xl bg-surface-1 overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-text-tertiary" />
                <span className="text-[10px] text-text-tertiary tracking-widest uppercase">Nové podněty</span>
              </div>
              <span className="text-[10px] font-mono text-text-tertiary bg-surface-2 px-1.5 py-0.5 rounded">{unreadNotifications.length}</span>
            </div>
            <div className="flex flex-col gap-1 px-3 pb-3">
              {unreadNotifications.slice(0, 3).map((n) => {
                const NIcon = NOTIF_ICON[n.type]
                const nColor = NOTIF_COLOR[n.type]
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => n.jobId ? router.push(`/jobs/${n.jobId}`) : router.push("/notifications")}
                    className="flex items-start gap-3 rounded-xl bg-surface-2 px-3 py-3 text-left transition-colors hover:bg-surface-3 active:bg-surface-3"
                  >
                    <div className={`flex items-center justify-center size-8 rounded-full ${nColor} bg-surface-2 shrink-0 mt-0.5`}>
                      <NIcon className={`size-4 ${nColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium block">{n.title}</span>
                      {n.hint && <span className="text-xs text-text-secondary italic block mt-0.5">{n.hint}</span>}
                      <span className="text-[10px] text-text-tertiary block mt-1">{n.time}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Program dne */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-text-tertiary tracking-widest uppercase">Program dne</span>
            <button type="button" onClick={() => router.push("/jobs")} className="text-[11px] text-success flex items-center gap-0.5 hover:text-success/80 transition-colors">
              vše <ChevronRight className="size-3" />
            </button>
          </div>

          {dayJobs.length === 0 ? (
            <div className="rounded-2xl bg-surface-1 px-4 py-10 text-center">
              <p className="text-sm text-text-secondary">{isToday ? "Žádné akce na dnes." : "Na tento den nemáte nic."}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {dayJobs.map((job) => {
                const config = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.survey
                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => openJob(job)}
                    className={`flex items-stretch w-full text-left rounded-2xl bg-surface-1 overflow-hidden transition-colors hover:bg-surface-2 active:bg-surface-2 border-l-[3px] ${config.borderColor}`}
                  >
                    {/* Time column */}
                    <div className="flex flex-col items-center justify-center w-[72px] shrink-0 py-4">
                      <span className="text-base font-mono font-bold">{job.time || "—"}</span>
                      <span className="text-[9px] text-text-tertiary tracking-wider">{timeOfDay(job.time)}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 py-4 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-semibold truncate">{job.client}</span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-surface-2 ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      <span className="text-xs text-text-secondary truncate block mt-0.5">{job.pickup.split(",")[0]}</span>
                      {job.hint && <span className="text-xs text-success italic block mt-1">{job.hint}</span>}
                      {!job.hint && job.price !== "\u2014" && <span className="text-xs font-mono text-text-tertiary mt-1 block">{job.price}</span>}
                    </div>

                    <div className="flex items-center pr-3 shrink-0">
                      <ChevronRight className="size-4 text-text-tertiary" />
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Vyžaduje pozornost */}
        {isToday && attentionJobs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-text-tertiary tracking-widest uppercase">Vyžaduje pozornost</span>
              <button type="button" onClick={() => router.push("/jobs")} className="text-[11px] text-success flex items-center gap-0.5 hover:text-success/80 transition-colors">
                vše <ChevronRight className="size-3" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {attentionJobs.map((job) => {
                const config = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.approval
                const AttnIcon = ATTENTION_ICON[job.status] ?? AlertCircle
                const detail = job.status === "approval" && job.sentDate
                  ? `Odesláno ${new Date(job.sentDate).toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric" })}. · čeká ${Math.round((new Date(TODAY).getTime() - new Date(job.sentDate!).getTime()) / 86400000)} dny`
                  : job.statusLabel
                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => openJob(job)}
                    className={`flex items-center gap-3 rounded-2xl bg-surface-1 px-4 py-3.5 w-full text-left transition-colors hover:bg-surface-2 active:bg-surface-2 border-l-[3px] ${config.borderColor}`}
                  >
                    <div className={`flex items-center justify-center size-9 rounded-full ${config.color} bg-surface-2 shrink-0`}>
                      <AttnIcon className={`size-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold">{job.client}</span>
                      <span className="text-xs text-text-tertiary block mt-0.5">{detail}</span>
                    </div>
                    <span className="text-sm font-mono shrink-0">{job.price}</span>
                    <ChevronRight className="size-4 text-text-tertiary shrink-0" />
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

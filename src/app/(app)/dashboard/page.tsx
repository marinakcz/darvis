"use client"

import { useState, useCallback, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, AlertCircle, CheckCircle2, XCircle, MessageSquare, RefreshCw, MessageCircle } from "lucide-react"
import { SectionHeader } from "@/components/ds"
import { MOCK_JOBS, MOCK_NOTIFICATIONS, TODAY } from "@/lib/mock-data"
import type { MockJob, MockNotification } from "@/lib/mock-data"

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dotColor: string; borderColor: string }> = {
  survey: { label: "Zaměření", color: "text-blue-400", dotColor: "bg-blue-400", borderColor: "border-l-blue-400" },
  execution: { label: "Stěhování", color: "text-green-400", dotColor: "bg-green-400", borderColor: "border-l-green-400" },
  approval: { label: "Schválení", color: "text-yellow-400", dotColor: "bg-yellow-400", borderColor: "border-l-yellow-400" },
  invoicing: { label: "Fakturace", color: "text-purple-400", dotColor: "bg-purple-400", borderColor: "border-l-purple-400" },
}

const NOTIF_ICON: Record<MockNotification["type"], typeof CheckCircle2> = {
  approval: CheckCircle2, rejection: XCircle, message: MessageSquare, change: RefreshCw, comment: MessageCircle,
}
const NOTIF_COLOR: Record<MockNotification["type"], string> = {
  approval: "text-green-400", rejection: "text-red-400", message: "text-blue-400", change: "text-amber-400", comment: "text-purple-400",
}

function getWeekDays(todayStr: string) {
  const today = new Date(todayStr)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const dateStr = d.toISOString().split("T")[0]
    return { date: dateStr, dayNum: d.getDate(), dayName: d.toLocaleDateString("cs-CZ", { weekday: "short" }), isToday: dateStr === todayStr }
  })
}

function getJobsForDate(date: string): MockJob[] {
  return MOCK_JOBS.filter((j) => j.date === date)
}

function getDateDots(date: string): string[] {
  const jobs = getJobsForDate(date)
  const dots: string[] = []
  if (jobs.some((j) => j.status === "survey")) dots.push("bg-blue-400")
  if (jobs.some((j) => j.status === "execution")) dots.push("bg-green-400")
  if (jobs.some((j) => j.status === "approval")) dots.push("bg-yellow-400")
  return dots
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
  const selectedFormatted = new Date(selectedDate).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" })

  return (
    <div className="flex flex-1 flex-col ios-fade-in">
      {/* Header */}
      <header className="bg-surface-0 px-4 pt-4 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-text-tertiary capitalize">{selectedFormatted}</p>
            <h1 className="text-2xl font-bold tracking-tight mt-0.5">
              {isToday ? "Dobrý den, Jan" : `Program — ${new Date(selectedDate).toLocaleDateString("cs-CZ", { weekday: "short", day: "numeric", month: "numeric" })}`}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="flex items-center justify-center size-10 rounded-full bg-surface-2 text-text-secondary text-sm font-semibold shrink-0 mt-1 hover:bg-surface-3 transition-colors"
          >
            JT
          </button>
        </div>
      </header>

      {/* Day picker */}
      <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto">
        {weekDays.map((day) => {
          const isSelected = day.date === selectedDate
          const dots = getDateDots(day.date)
          return (
            <button
              key={day.date}
              type="button"
              onClick={() => setSelectedDate(day.date)}
              className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 min-w-[44px] transition-colors ${
                isSelected ? "bg-surface-2 text-text-primary" : "text-text-tertiary hover:bg-surface-1"
              }`}
            >
              <span className={`text-[10px] uppercase ${isSelected ? "text-text-secondary" : "text-text-tertiary"}`}>{day.dayName}</span>
              <span className="text-base font-bold">{day.dayNum}</span>
              <div className="flex items-center gap-0.5 h-2">
                {dots.map((dotColor, i) => (
                  <span key={i} className={`size-1.5 rounded-full ${isSelected ? "bg-text-secondary" : dotColor}`} />
                ))}
              </div>
            </button>
          )
        })}
      </div>

      <main className="flex flex-1 flex-col gap-4 px-4 pb-4 overflow-y-auto">
        {/* Notification widget */}
        {isToday && unreadNotifications.length > 0 && (
          <button
            type="button"
            onClick={() => router.push("/notifications")}
            className="rounded-2xl bg-red-500/8 overflow-hidden text-left transition-colors hover:bg-red-500/12 active:bg-red-500/12"
          >
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400">
                <span className="size-2 rounded-full bg-red-500" />
                {unreadNotifications.length} {unreadNotifications.length === 1 ? "nové upozornění" : "nová upozornění"}
              </span>
              <ChevronRight className="size-4 text-text-tertiary" />
            </div>
            <div className="divide-y divide-border/30">
              {unreadNotifications.slice(0, 2).map((n) => {
                const NIcon = NOTIF_ICON[n.type]
                const nColor = NOTIF_COLOR[n.type]
                return (
                  <div key={n.id} className="flex items-start gap-2.5 px-4 py-2.5">
                    <NIcon className={`size-4 shrink-0 mt-0.5 ${nColor}`} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium line-clamp-1">{n.title}</span>
                      <span className="text-[10px] text-text-tertiary block">{n.time}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </button>
        )}

        {/* Summary card */}
        <div className="rounded-2xl bg-surface-1 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                {dayJobs.length === 0
                  ? (isToday ? "Dnes nemáte nic v plánu" : "Žádné akce")
                  : `${dayJobs.length} ${dayJobs.length === 1 ? "akce" : dayJobs.length >= 2 && dayJobs.length <= 4 ? "akce" : "akcí"}`}
              </p>
              {dayJobs.length > 0 && (
                <div className="flex items-center gap-3 mt-1">
                  {daySurveys > 0 && (
                    <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <span className="size-2 rounded-full bg-blue-400" />{daySurveys}x zaměření
                    </span>
                  )}
                  {dayExecutions > 0 && (
                    <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <span className="size-2 rounded-full bg-green-400" />{dayExecutions}x stěhování
                    </span>
                  )}
                </div>
              )}
            </div>
            <span className="font-mono text-3xl font-bold text-text-tertiary/40">{dayJobs.length}</span>
          </div>
        </div>

        {/* Timeline */}
        <SectionHeader>{isToday ? "Program dne" : "Program"}</SectionHeader>
        {dayJobs.length === 0 ? (
          <div className="rounded-2xl bg-surface-1 px-4 py-8 text-center">
            <p className="text-sm text-text-secondary">{isToday ? "Žádné akce na dnes." : "Na tento den nemáte nic."}</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-surface-1 overflow-hidden divide-y divide-border">
            {dayJobs.map((job) => {
              const config = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.survey
              return (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => openJob(job)}
                  className={`flex items-stretch w-full text-left transition-colors hover:bg-surface-2 active:bg-surface-2 border-l-[3px] ${config.borderColor}`}
                >
                  <div className="flex flex-col items-center justify-center w-16 shrink-0 py-3">
                    <span className="text-sm font-mono font-medium text-text-secondary">{job.time || "—"}</span>
                  </div>
                  <div className="flex-1 min-w-0 py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate">{job.client}</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${config.dotColor}/15 ${config.color}`}>{config.label}</span>
                    </div>
                    <span className="text-xs text-text-tertiary truncate block mt-0.5">{job.pickup.split(",")[0]}</span>
                    {job.price !== "\u2014" && <span className="text-xs font-mono text-text-tertiary mt-0.5 block">{job.price}</span>}
                  </div>
                  <div className="flex items-center pr-3 shrink-0">
                    <ChevronRight className="size-4 text-text-tertiary" />
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Vyžaduje pozornost */}
        {isToday && attentionJobs.length > 0 && (
          <>
            <SectionHeader>Vyžaduje pozornost</SectionHeader>
            <div className="rounded-2xl bg-surface-1 overflow-hidden divide-y divide-border">
              {attentionJobs.map((job) => {
                const config = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.approval
                const detail = job.status === "approval" && job.sentDate
                  ? `Odesláno ${new Date(job.sentDate).toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric" })}`
                  : job.statusLabel
                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => openJob(job)}
                    className={`flex items-center gap-3 px-4 py-3 min-h-[44px] w-full text-left transition-colors hover:bg-surface-2 active:bg-surface-2 border-l-[3px] ${config.borderColor}`}
                  >
                    <AlertCircle className={`size-4 shrink-0 ${config.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium truncate">{job.client}</span>
                        <span className="text-sm font-mono shrink-0">{job.price}</span>
                      </div>
                      <span className="text-xs text-text-tertiary block mt-0.5">{detail}</span>
                    </div>
                    <ChevronRight className="size-4 text-text-tertiary shrink-0" />
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* Link to full job list */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => router.push("/jobs")}
            className="flex items-center justify-center gap-1.5 w-full py-3 text-sm text-success hover:text-success/80 transition-colors"
          >
            Všechny zakázky
            <ChevronRight className="size-4" />
          </button>
        </div>
      </main>
    </div>
  )
}

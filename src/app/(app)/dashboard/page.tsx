"use client"

import { useRouter } from "next/navigation"
import { useState, useCallback, useSyncExternalStore } from "react"
import { Zap, FileText, MapPin, Clock, ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MOCK_JOBS, TODAY } from "@/lib/mock-data"
import type { MockJob } from "@/lib/mock-data"
import type { SurveyMode } from "@/lib/types"

// Ensure component only renders on client (avoids hydration mismatch from localStorage)
function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

/** Single job row used across dashboard sections */
function JobRow({ job, onClick, children }: { job: MockJob; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 min-h-[44px] w-full text-left transition-colors hover:bg-accent active:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div className="flex-1 min-w-0">{children}</div>
      <ChevronRight className="size-4 text-muted-foreground/50 shrink-0" />
    </button>
  )
}

/** Section header -- uppercase small grey label */
function SectionHeader({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-muted-foreground uppercase tracking-wider px-1 pt-4 pb-1">{children}</p>
}

/** Grouped card container with divide-y */
function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
      {children}
    </div>
  )
}

/** Mode picker subview */
function ModePicker({ onNewJob, onBack }: { onNewJob: (mode: SurveyMode) => void; onBack: () => void }) {
  return (
    <div className="flex flex-1 flex-col ios-slide-in">
      <header className="border-b bg-background/80 backdrop-blur-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onBack} aria-label="Zpět na seznam zakázek" className="flex items-center gap-0.5 text-primary text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded">
            <ChevronLeft className="size-5" />
            <span>Zpět</span>
          </button>
          <h1 className="text-lg font-semibold tracking-tight flex-1 text-center pr-12">Nová zakázka</h1>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 px-4 py-6">
        <p className="text-sm text-muted-foreground">Jak chcete zaměřit?</p>
        <button type="button" onClick={() => onNewJob("quick")} className="flex flex-col gap-2 rounded-xl border border-border p-4 text-left transition-colors hover:bg-accent active:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <div className="flex items-center gap-2">
            <Zap className="size-5" />
            <span className="text-base font-semibold">Rychlý odhad</span>
          </div>
          <p className="text-sm text-muted-foreground">Projdete místnosti a odhadnete % zaplnění auta. Rychlé, bez počítání kusů.</p>
          <span className="text-xs text-muted-foreground font-mono">~2 min · telefon</span>
        </button>
        <button type="button" onClick={() => onNewJob("detailed")} className="flex flex-col gap-2 rounded-xl border border-border p-4 text-left transition-colors hover:bg-accent active:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <div className="flex items-center gap-2">
            <FileText className="size-5" />
            <span className="text-base font-semibold">Detailní zaměření</span>
          </div>
          <p className="text-sm text-muted-foreground">Soupis každé položky s kusy, službami a materiálem. Přesné, kompletní nabídka.</p>
          <span className="text-xs text-muted-foreground font-mono">~10 min · tablet</span>
        </button>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  const mounted = useIsMounted()
  const router = useRouter()
  const [view, setView] = useState<"list" | "mode-picker">("list")

  const openDetail = useCallback((job: MockJob) => {
    router.push(`/jobs/${job.id}`)
  }, [router])

  const handleNewJob = useCallback((mode: SurveyMode) => {
    // For a new standalone job, navigate to survey with mode param
    // For now, create a temporary "new" job entry
    router.push(`/jobs/new/survey?mode=${mode}`)
  }, [router])

  if (!mounted) return null

  if (view === "mode-picker") {
    return <ModePicker onNewJob={handleNewJob} onBack={() => setView("list")} />
  }

  // Derive phase groups
  const todayJobs = MOCK_JOBS.filter((j) => j.date === TODAY)
  const surveyJobs = MOCK_JOBS.filter((j) => j.status === "survey")
  const approvalJobs = MOCK_JOBS.filter((j) => j.status === "approval")
  const executionJobs = MOCK_JOBS.filter((j) => j.status === "execution")
  const invoicingJobs = MOCK_JOBS.filter((j) => j.status === "invoicing")

  return (
    <div className="flex flex-1 flex-col ios-fade-in">
      {/* iOS large title header */}
      <header className="bg-background px-4 pt-4 pb-3">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider pb-1">Darvis</p>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight">Dobrý den, Jan</h1>
            <p className="text-sm text-muted-foreground">
              Dnes máte {todayJobs.length} {todayJobs.length === 1 ? "zakázku" : todayJobs.length >= 2 && todayJobs.length <= 4 ? "zakázky" : "zakázek"}
            </p>
          </div>
          <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary text-sm font-semibold shrink-0">
            JT
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-1 px-4 pb-4 overflow-y-auto">
        {/* Quick stats row */}
        <div className="flex items-center gap-2 py-2 overflow-x-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-400/10 text-blue-400 px-3 py-1.5 text-xs font-medium whitespace-nowrap">
            <MapPin className="size-3" />
            K zaměření: {surveyJobs.length}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400/10 text-yellow-400 px-3 py-1.5 text-xs font-medium whitespace-nowrap">
            <Clock className="size-3" />
            Schválení: {approvalJobs.length}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-400/10 text-green-400 px-3 py-1.5 text-xs font-medium whitespace-nowrap">
            <Zap className="size-3" />
            Realizace: {executionJobs.length}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-400/10 text-purple-400 px-3 py-1.5 text-xs font-medium whitespace-nowrap">
            <FileText className="size-3" />
            Fakturace: {invoicingJobs.length}
          </span>
        </div>

        {/* Section: Dnes */}
        <SectionHeader>Dnes</SectionHeader>
        {todayJobs.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">Dnes nemáte žádné zakázky.</p>
          </div>
        ) : (
          <SectionCard>
            {todayJobs.map((job) => {
              const borderColor = job.status === "survey" ? "border-l-blue-400" : job.status === "execution" ? "border-l-green-400" : "border-l-yellow-400"
              return (
                <div key={job.id} className={`border-l-[3px] ${borderColor}`}>
                  <JobRow job={job} onClick={() => openDetail(job)}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium truncate">{job.client}</span>
                      <span className="text-xs font-mono text-muted-foreground shrink-0">{job.time}</span>
                    </div>
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-xs text-muted-foreground truncate">{job.pickup.split(",")[0]}</span>
                      <span className={`text-[11px] font-medium ${job.statusColor}`}>{job.statusLabel}</span>
                    </div>
                  </JobRow>
                </div>
              )
            })}
          </SectionCard>
        )}

        {/* Section: K zaměření */}
        <SectionHeader>K zaměření</SectionHeader>
        <SectionCard>
          {surveyJobs.map((job) => {
            const dateFormatted = new Date(job.date).toLocaleDateString("cs-CZ", { weekday: "short", day: "numeric", month: "numeric" })
            return (
              <div key={job.id} className="border-l-[3px] border-l-blue-400">
                <JobRow job={job} onClick={() => openDetail(job)}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">{job.client}</span>
                    <span className="text-xs font-mono text-muted-foreground shrink-0">{dateFormatted}</span>
                  </div>
                  <span className="text-xs text-muted-foreground truncate block pt-0.5">{job.pickup.split(",")[0]}</span>
                </JobRow>
              </div>
            )
          })}
        </SectionCard>

        {/* Section: Čeká na schválení */}
        {approvalJobs.length > 0 && (
          <>
            <SectionHeader>Čeká na schválení</SectionHeader>
            <SectionCard>
              {approvalJobs.map((job) => {
                const sentFormatted = job.sentDate
                  ? new Date(job.sentDate).toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric" })
                  : ""
                return (
                  <div key={job.id} className="border-l-[3px] border-l-yellow-400">
                    <JobRow job={job} onClick={() => openDetail(job)}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium truncate">{job.client}</span>
                        <span className="text-sm font-mono shrink-0">{job.price}</span>
                      </div>
                      <span className="text-xs text-muted-foreground block pt-0.5">Odesláno {sentFormatted}</span>
                    </JobRow>
                  </div>
                )
              })}
            </SectionCard>
          </>
        )}

        {/* Section: Nadcházející realizace */}
        {executionJobs.length > 0 && (
          <>
            <SectionHeader>Nadcházející realizace</SectionHeader>
            <SectionCard>
              {executionJobs.map((job) => {
                const dateFormatted = new Date(job.date).toLocaleDateString("cs-CZ", { weekday: "short", day: "numeric", month: "numeric" })
                return (
                  <div key={job.id} className="border-l-[3px] border-l-green-400">
                    <JobRow job={job} onClick={() => openDetail(job)}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium truncate">{job.client}</span>
                        <span className="text-xs font-mono text-muted-foreground shrink-0">{dateFormatted}</span>
                      </div>
                      <span className="text-xs text-muted-foreground truncate block pt-0.5">{job.pickup.split(",")[0]}</span>
                    </JobRow>
                  </div>
                )
              })}
            </SectionCard>
          </>
        )}

        {/* New job button */}
        <div className="pt-4">
          <Button size="lg" className="h-14 text-base w-full rounded-2xl" onClick={() => setView("mode-picker")}>
            + Nová zakázka
          </Button>
        </div>
      </main>
    </div>
  )
}

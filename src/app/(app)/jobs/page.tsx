"use client"

import { useState, useCallback, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, ChevronDown, Search } from "lucide-react"
import { SectionHeader } from "@/components/ds"
import { MOCK_JOBS } from "@/lib/mock-data"
import type { MockJob } from "@/lib/mock-data"

function useIsMounted() {
  return useSyncExternalStore(() => () => {}, () => true, () => false)
}

const STATUS_CONFIG: Record<string, { label: string; color: string; borderColor: string }> = {
  survey: { label: "Zaměření", color: "text-blue-400", borderColor: "border-l-blue-400" },
  approval: { label: "Schválení", color: "text-yellow-400", borderColor: "border-l-yellow-400" },
  execution: { label: "Realizace", color: "text-green-400", borderColor: "border-l-green-400" },
  invoicing: { label: "Fakturace", color: "text-purple-400", borderColor: "border-l-purple-400" },
}

/** Requires technician action: unfinished surveys, pending approvals */
function needsAction(job: MockJob): boolean {
  return job.status === "survey" || job.status === "approval"
}

/** Scheduled work: execution jobs */
function isScheduled(job: MockJob): boolean {
  return job.status === "execution"
}

/** Done: invoicing */
function isDone(job: MockJob): boolean {
  return job.status === "invoicing"
}

export default function JobsListPage() {
  const mounted = useIsMounted()
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [doneExpanded, setDoneExpanded] = useState(false)

  const openJob = useCallback((job: MockJob) => { router.push(`/jobs/${job.id}`) }, [router])

  if (!mounted) return null

  // Filter by search
  const searchLower = search.toLowerCase()
  const allJobs = search
    ? MOCK_JOBS.filter((j) =>
        j.client.toLowerCase().includes(searchLower) ||
        j.pickup.toLowerCase().includes(searchLower) ||
        j.delivery.toLowerCase().includes(searchLower))
    : MOCK_JOBS

  const actionJobs = allJobs.filter(needsAction)
  const scheduledJobs = allJobs.filter(isScheduled)
  const doneJobs = allJobs.filter(isDone)

  const activeCount = actionJobs.length + scheduledJobs.length

  return (
    <div className="flex flex-1 flex-col ios-fade-in">
      <header className="bg-surface-0 px-4 pt-4 pb-2">
        <h1 className="text-2xl font-bold tracking-tight">Zakázky</h1>
        <p className="text-sm text-text-tertiary mt-0.5">
          {activeCount} aktivní{doneJobs.length > 0 ? ` · ${doneJobs.length} dokončen${doneJobs.length === 1 ? "á" : "ých"}` : ""}
        </p>
      </header>

      <main className="flex flex-1 flex-col gap-4 px-4 pb-4 overflow-y-auto">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hledat klienta nebo adresu..."
            aria-label="Hledat zakázky"
            className="w-full h-11 rounded-xl bg-surface-1 pl-10 pr-4 text-sm outline-none placeholder:text-text-tertiary focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors"
          />
        </div>

        {/* Vyžaduje akci */}
        {actionJobs.length > 0 && (
          <>
            <SectionHeader>Vyžaduje akci · {actionJobs.length}</SectionHeader>
            <JobGroup jobs={actionJobs} onOpen={openJob} />
          </>
        )}

        {/* Naplánováno */}
        {scheduledJobs.length > 0 && (
          <>
            <SectionHeader>Naplánováno · {scheduledJobs.length}</SectionHeader>
            <JobGroup jobs={scheduledJobs} onOpen={openJob} />
          </>
        )}

        {/* Dokončené — collapsed */}
        {doneJobs.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => setDoneExpanded((p) => !p)}
              aria-expanded={doneExpanded}
              className="flex items-center justify-between px-1 py-1"
            >
              <span className="text-xs text-text-tertiary uppercase tracking-wider">
                Dokončené · {doneJobs.length}
              </span>
              <ChevronDown className={`size-4 text-text-tertiary transition-transform ${doneExpanded ? "rotate-180" : ""}`} />
            </button>
            {doneExpanded && <JobGroup jobs={doneJobs} onOpen={openJob} />}
          </>
        )}

        {/* No results */}
        {search && allJobs.length === 0 && (
          <div className="rounded-2xl bg-surface-1 px-4 py-8 text-center">
            <p className="text-sm text-text-secondary">Žádné výsledky pro &ldquo;{search}&rdquo;</p>
          </div>
        )}
      </main>
    </div>
  )
}

function JobGroup({ jobs, onOpen }: { jobs: MockJob[]; onOpen: (job: MockJob) => void }) {
  return (
    <div className="rounded-2xl bg-surface-1 overflow-hidden divide-y divide-border">
      {jobs.map((job) => (
        <JobRow key={job.id} job={job} onClick={() => onOpen(job)} />
      ))}
    </div>
  )
}

function JobRow({ job, onClick }: { job: MockJob; onClick: () => void }) {
  const config = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.survey
  const dateFormatted = new Date(job.date).toLocaleDateString("cs-CZ", { weekday: "short", day: "numeric", month: "numeric" })

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3.5 min-h-[44px] w-full text-left transition-colors hover:bg-surface-2 active:bg-surface-2 border-l-[3px] ${config.borderColor}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold truncate">{job.client}</span>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-surface-2 ${config.color}`}>
            {config.label}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-text-tertiary truncate">
            {job.pickup.split(",")[0]} → {job.delivery.split(",")[0]}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] font-mono text-text-tertiary">{dateFormatted}</span>
          {job.price !== "\u2014" && (
            <>
              <span className="text-text-tertiary">·</span>
              <span className="text-[11px] font-mono text-text-secondary">{job.price}</span>
            </>
          )}
          {job.time && (
            <>
              <span className="text-text-tertiary">·</span>
              <span className="text-[11px] font-mono text-text-secondary">{job.time}</span>
            </>
          )}
        </div>
      </div>
      <ChevronRight className="size-4 text-text-tertiary shrink-0" />
    </button>
  )
}

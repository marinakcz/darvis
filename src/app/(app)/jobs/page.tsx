"use client"

import { useState, useCallback, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, ChevronDown, Search, Plus, Loader2 } from "lucide-react"
import { SectionHeader, ActionButton } from "@/components/ds"
import { getStatusConfig, needsAction, isActive, isDone, isTerminal, STATUS_CONFIG, type JobStatus } from "@/lib/job-status"
import { TagPill } from "@/components/tag-pill"

function useIsMounted() {
  return useSyncExternalStore(() => () => {}, () => true, () => false)
}

interface DbJob {
  id: string
  jobType: string
  status: string
  date: string | null
  pickupAddress: string
  deliveryAddress: string
  pickupFloor: number
  pickupElevator: boolean
  deliveryFloor: number
  deliveryElevator: boolean
  distance: string
  dispatcherNote: string | null
  tags: string[] | null
  createdAt: string
  customerName: string | null
  customerPhone: string | null
  customerEmail: string | null
}

export default function JobsListPage() {
  const mounted = useIsMounted()
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<JobStatus | null>(null)
  const [doneExpanded, setDoneExpanded] = useState(false)
  const [jobs, setJobs] = useState<DbJob[]>([])
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [creating, setCreating] = useState(false)

  const openJob = useCallback((job: DbJob) => { router.push(`/jobs/${job.id}`) }, [router])

  // Load from DB
  if (mounted && !loaded) {
    setLoaded(true)
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((data) => { setJobs(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  async function createNewJob() {
    setCreating(true)
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobType: "apartment" }),
      })
      if (res.ok) {
        const { id } = await res.json()
        router.push(`/jobs/${id}/survey`)
      }
    } catch { /* ignore */ }
    setCreating(false)
  }

  if (!mounted || loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-text-tertiary" />
      </div>
    )
  }

  // Filter by search + status
  const searchLower = search.toLowerCase()
  let allJobs = search
    ? jobs.filter((j) =>
        (j.customerName || "").toLowerCase().includes(searchLower) ||
        j.pickupAddress.toLowerCase().includes(searchLower) ||
        j.deliveryAddress.toLowerCase().includes(searchLower))
    : jobs

  if (statusFilter) {
    allJobs = allJobs.filter((j) => j.status === statusFilter)
  }

  const actionJobs = allJobs.filter((j) => needsAction(j.status))
  const activeJobs = allJobs.filter((j) => isActive(j.status))
  const doneJobs = allJobs.filter((j) => isDone(j.status))

  const activeCount = actionJobs.length + activeJobs.length

  return (
    <div className="flex flex-1 flex-col ios-fade-in">
      <header className="bg-surface-0 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Zakázky</h1>
            <p className="text-sm text-text-tertiary mt-0.5">
              {activeCount} aktivní{doneJobs.length > 0 ? ` · ${doneJobs.length} dokončen${doneJobs.length === 1 ? "á" : "ých"}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={createNewJob}
            disabled={creating}
            className="flex items-center gap-1.5 rounded-xl bg-success text-success-foreground px-3 py-2 text-sm font-medium hover:bg-success/90 active:bg-success/90 transition-colors min-h-[44px]"
          >
            {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Nová
          </button>
        </div>
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

        {/* Status filter chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          <button type="button" onClick={() => setStatusFilter(null)}
            className={`shrink-0 text-[11px] font-medium px-2.5 py-1.5 rounded-lg transition-colors min-h-[32px] ${!statusFilter ? "bg-success text-success-foreground" : "bg-surface-1 text-text-secondary hover:bg-surface-2"}`}>
            Vše
          </button>
          {(["draft", "survey", "offer", "approved", "execution", "invoicing", "done", "lost"] as JobStatus[]).map((s) => {
            const cfg = STATUS_CONFIG[s]
            const count = jobs.filter((j) => j.status === s).length
            if (count === 0) return null
            return (
              <button key={s} type="button" onClick={() => setStatusFilter((prev) => prev === s ? null : s)}
                className={`shrink-0 flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg transition-colors min-h-[32px] ${statusFilter === s ? "bg-success text-success-foreground" : "bg-surface-1 text-text-secondary hover:bg-surface-2"}`}>
                <span className={`size-1.5 rounded-full ${cfg.dotColor}`} />
                {cfg.label} <span className="text-text-tertiary">{count}</span>
              </button>
            )
          })}
        </div>

        {/* Empty state */}
        {jobs.length === 0 && !search && (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-lg text-text-secondary">Zatím žádné zakázky</p>
            <p className="text-sm text-text-tertiary">Vytvořte první zakázku a začněte zaměření.</p>
            <ActionButton onClick={createNewJob} disabled={creating} className="max-w-[240px]">
              {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Vytvořit zakázku
            </ActionButton>
          </div>
        )}

        {/* Vyžaduje akci */}
        {actionJobs.length > 0 && (
          <>
            <SectionHeader>Vyžaduje akci · {actionJobs.length}</SectionHeader>
            <JobGroup jobs={actionJobs} onOpen={openJob} />
          </>
        )}

        {/* Aktivní */}
        {activeJobs.length > 0 && (
          <>
            <SectionHeader>Aktivní · {activeJobs.length}</SectionHeader>
            <JobGroup jobs={activeJobs} onOpen={openJob} />
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

function JobGroup({ jobs, onOpen }: { jobs: DbJob[]; onOpen: (job: DbJob) => void }) {
  return (
    <div className="rounded-2xl bg-surface-1 overflow-hidden divide-y divide-border">
      {jobs.map((job) => (
        <JobRow key={job.id} job={job} onClick={() => onOpen(job)} />
      ))}
    </div>
  )
}

function JobRow({ job, onClick }: { job: DbJob; onClick: () => void }) {
  const config = getStatusConfig(job.status)
  const dateFormatted = job.date
    ? new Date(job.date).toLocaleDateString("cs-CZ", { weekday: "short", day: "numeric", month: "numeric" })
    : "—"

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3.5 min-h-[44px] w-full text-left transition-colors hover:bg-surface-2 active:bg-surface-2 border-l-[3px] ${config.borderColor}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold truncate">{job.customerName || "Nový klient"}</span>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-surface-2 ${config.color}`}>
            {config.label}
          </span>
          {job.tags?.map((tag) => <TagPill key={tag} tag={tag} />)}
        </div>
        {(job.pickupAddress || job.deliveryAddress) && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-text-tertiary truncate">
              {(job.pickupAddress || "—").split(",")[0]} → {(job.deliveryAddress || "—").split(",")[0]}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] font-mono text-text-tertiary">{dateFormatted}</span>
        </div>
      </div>
      <ChevronRight className="size-4 text-text-tertiary shrink-0" />
    </button>
  )
}

/**
 * Centrální stavový automat zakázek.
 * Jeden zdroj pravdy pro stavy, barvy, labely, přechody.
 */

/* ── Stavy ── */

export const JOB_STATUSES = [
  "draft",
  "survey",
  "offer",
  "approved",
  "execution",
  "invoicing",
  "done",
  "lost",
] as const

export type JobStatus = (typeof JOB_STATUSES)[number]

/* ── Konfigurace stavů ── */

export interface StatusConfig {
  label: string
  /** Tailwind text color class */
  color: string
  /** Tailwind border-l color class */
  borderColor: string
  /** Tailwind bg color class for dots/indicators */
  dotColor: string
}

export const STATUS_CONFIG: Record<JobStatus, StatusConfig> = {
  draft:     { label: "Koncept",    color: "text-status-new",          borderColor: "border-l-status-new",       dotColor: "bg-status-new" },
  survey:    { label: "Zaměření",   color: "text-status-survey",       borderColor: "border-l-status-survey",    dotColor: "bg-status-survey" },
  offer:     { label: "Nabídka",    color: "text-status-approval",     borderColor: "border-l-status-approval",  dotColor: "bg-status-approval" },
  approved:  { label: "Schváleno",  color: "text-status-scheduled",    borderColor: "border-l-status-scheduled", dotColor: "bg-status-scheduled" },
  execution: { label: "Realizace",  color: "text-status-execution",    borderColor: "border-l-status-execution", dotColor: "bg-status-execution" },
  invoicing: { label: "Fakturace",  color: "text-status-invoicing",    borderColor: "border-l-status-invoicing", dotColor: "bg-status-invoicing" },
  done:      { label: "Hotovo",     color: "text-text-tertiary",       borderColor: "border-l-zinc-400",         dotColor: "bg-zinc-400" },
  lost:      { label: "Ztraceno",   color: "text-status-lost",         borderColor: "border-l-status-lost",      dotColor: "bg-status-lost" },
}

/* ── Stavový automat — povolené přechody ── */

const TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  draft:     ["survey", "lost"],
  survey:    ["offer", "lost"],
  offer:     ["approved", "lost"],
  approved:  ["execution", "lost"],
  execution: ["invoicing", "done", "lost"],
  invoicing: ["done", "lost"],
  done:      [],
  lost:      ["draft"],  // reaktivace ztracené zakázky
}

export function canTransition(from: JobStatus, to: JobStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false
}

export function allowedTransitions(from: JobStatus): JobStatus[] {
  return TRANSITIONS[from] ?? []
}

/* ── Helper funkce pro kategorizaci ── */

export function needsAction(status: string): boolean {
  return status === "draft" || status === "survey"
}

export function needsAttention(status: string): boolean {
  return status === "offer" || status === "invoicing"
}

export function isActive(status: string): boolean {
  return status === "offer" || status === "approved" || status === "execution"
}

export function isTerminal(status: string): boolean {
  return status === "done" || status === "lost"
}

export function isDone(status: string): boolean {
  return status === "invoicing" || status === "done"
}

/** Vrátí config pro daný status, s fallbackem na draft */
export function getStatusConfig(status: string): StatusConfig {
  return STATUS_CONFIG[status as JobStatus] ?? STATUS_CONFIG.draft
}

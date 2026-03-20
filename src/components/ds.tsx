/**
 * Darvis Design System — Base Components
 *
 * Layered surface model:
 *   Surface  → L1 card (bg-surface-1)
 *   Group    → L2 nested rows (bg-surface-2)
 *   Row      → key-value pair inside Group
 *
 * Actions:
 *   ActionButton  → green CTA (bg-success)
 *   GhostButton   → outlined secondary
 *
 * Feedback:
 *   Alert    → amber/red/green inline banner
 */

import { ChevronRight } from "lucide-react"

// ── Surfaces ──

/** L1 card — main content container */
export function Surface({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-surface-1 ${className}`}>
      {children}
    </div>
  )
}

/** L2 nested group — rows inside a Surface */
export function Group({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl bg-surface-2 overflow-hidden divide-y divide-border ${className}`}>
      {children}
    </div>
  )
}

// ── Data Display ──

/** Key-value row inside a Group */
export function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 min-h-[44px]">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className={`text-sm text-text-primary ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  )
}

/** Tappable row that navigates somewhere */
export function TapRow({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 min-h-[44px] w-full text-left transition-colors hover:bg-surface-3 active:bg-surface-3"
    >
      <div className="flex-1 min-w-0">{children}</div>
      <ChevronRight className="size-4 text-text-tertiary shrink-0" />
    </button>
  )
}

// ── Section Header ──

export function SectionHeader({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-text-secondary uppercase tracking-wider px-1">{children}</p>
}

// ── Actions ──

/** Primary green CTA button */
export function ActionButton({ children, onClick, disabled, className = "" }: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 h-14 w-full rounded-2xl bg-success text-success-foreground text-base font-semibold transition-colors hover:bg-success/90 active:bg-success/85 disabled:opacity-40 disabled:pointer-events-none ${className}`}
    >
      {children}
    </button>
  )
}

/** Ghost/outlined secondary button */
export function GhostButton({ children, onClick, className = "" }: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 h-12 w-full rounded-2xl border border-border text-sm font-medium text-text-secondary transition-colors hover:bg-surface-2 active:bg-surface-2 ${className}`}
    >
      {children}
    </button>
  )
}

// ── Feedback ──

type AlertVariant = "warning" | "error" | "success" | "info"

const ALERT_STYLES: Record<AlertVariant, string> = {
  warning: "border-warning/30 bg-warning/8 text-warning",
  error: "border-red-500/30 bg-red-500/8 text-red-400",
  success: "border-emerald-500/30 bg-emerald-500/8 text-emerald-400",
  info: "border-blue-500/30 bg-blue-500/8 text-blue-400",
}

/** Inline alert banner */
export function Alert({ variant = "warning", title, children }: {
  variant?: AlertVariant
  title?: string
  children: React.ReactNode
}) {
  return (
    <div className={`rounded-2xl border px-4 py-3 ${ALERT_STYLES[variant]}`}>
      {title && <p className="text-xs font-medium mb-1">{title}</p>}
      <p className="text-sm opacity-80">{children}</p>
    </div>
  )
}

// ── Stat ──

/** Compact stat box (e.g. volume, trucks, workers) */
export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="font-mono text-base font-bold text-text-primary">{value}</span>
      <span className="text-[10px] text-text-tertiary">{label}</span>
    </div>
  )
}

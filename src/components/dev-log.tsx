// SwiftUI: Custom Timeline view
"use client"

import { useState } from "react"
import Image from "next/image"
import { Check, Circle, CheckCircle2 } from "lucide-react"

interface LogItem {
  text: string
  description: string
}

interface LogEntry {
  version: string
  date: string
  status: "done" | "in-progress" | "ready"
  title: string
  summary: string
  items: LogItem[]
}

const STATUS_CONFIG = {
  done: {
    dot: "bg-emerald-400",
    label: "Hotovo",
    labelClass: "text-emerald-400",
    border: "border-emerald-500/20 hover:border-emerald-500/40",
    bg: "bg-emerald-500/5",
    check: "text-emerald-500",
  },
  "in-progress": {
    dot: "bg-amber-400 animate-pulse",
    label: "Probíhá",
    labelClass: "text-amber-400",
    border: "border-amber-500/20 hover:border-amber-500/40",
    bg: "bg-amber-500/5",
    check: "text-amber-500",
  },
  ready: {
    dot: "bg-zinc-500",
    label: "Připraveno",
    labelClass: "text-zinc-400",
    border: "border-zinc-700/50 hover:border-zinc-600",
    bg: "bg-zinc-800/20",
    check: "text-zinc-500",
  },
}

function ItemDetail({ item, status }: { item: LogItem; status: LogEntry["status"] }) {
  const [open, setOpen] = useState(false)
  const config = STATUS_CONFIG[status]

  return (
    <div
      onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
      className="flex gap-2 pl-1 cursor-pointer rounded-md px-2 py-1.5 -mx-2 transition-colors hover:bg-zinc-800/40 min-h-[44px] items-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <span className={`mt-[2px] shrink-0 ${config.check}`}>
        {status === "done" ? <Check className="size-3.5" /> : <Circle className="size-3" />}
      </span>
      <div className="flex flex-col gap-0 flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-medium text-zinc-200 flex-1">
            {item.text}
          </span>
          <span className="text-xs text-zinc-700 shrink-0">
            {open ? "▾" : "▸"}
          </span>
        </div>
        {open && (
          <span className="text-xs leading-relaxed text-zinc-500 pt-0.5">
            {item.description}
          </span>
        )}
      </div>
    </div>
  )
}

function LogSection({ entry, defaultOpen }: { entry: LogEntry; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const config = STATUS_CONFIG[entry.status]

  return (
    <div className={`flex flex-col rounded-xl border ${config.border} ${config.bg} transition-colors overflow-hidden`}>
      <div onClick={() => setOpen(!open)} className="flex items-center gap-2.5 p-4 cursor-pointer">
        <div className={`h-2.5 w-2.5 rounded-full ${config.dot} shrink-0`} />
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold text-zinc-100">{entry.title}</span>
            <span className="text-xs font-mono text-zinc-500">v{entry.version}</span>
            <span className={`text-xs font-medium ${config.labelClass}`}>{config.label}</span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">{entry.summary}</p>
        </div>
        <span className="text-xs text-zinc-700 shrink-0">{open ? "▾" : "▸"}</span>
      </div>

      {open && (
        <div className="flex flex-col border-t border-zinc-800/50 mx-4 mb-3 pt-1">
          {entry.items.map((item, i) => (
            <ItemDetail key={i} item={item} status={entry.status} />
          ))}
          {entry.status === "done" && (
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-zinc-800/30 pl-1">
              <CheckCircle2 className="size-3 text-emerald-500" />
              <span className="text-xs text-emerald-500/70 font-medium">Potvrzeno</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function DevLog({ embedded = false }: { embedded?: boolean }) {
  const [entries, setEntries] = useState<LogEntry[] | null>(null)
  const [loaded, setLoaded] = useState(false)

  // Load from API
  if (!loaded) {
    setLoaded(true)
    fetch("/api/pipeline?type=pipeline")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setEntries(data)
      })
      .catch(() => {})
  }

  // Fallback while loading
  if (!entries) {
    return (
      <div className={`flex flex-col overflow-x-hidden ${embedded ? "" : "p-5 h-full"}`}>
        <p className="text-sm text-zinc-500">Načítám...</p>
      </div>
    )
  }

  return (
    <div className={`flex flex-col overflow-x-hidden ${embedded ? "" : "p-5 h-full"}`}>
      {!embedded && (
        <div className="flex items-center gap-3 pb-4">
          <Image src="/logo.svg" alt="Darvis" width={110} height={30} className="h-5 w-auto opacity-70" />
          <span className="text-xs text-zinc-600 uppercase tracking-[0.15em] font-medium">
            Dev log
          </span>
        </div>
      )}

      <div className="flex flex-col gap-2.5 flex-1">
        {entries.map((entry, i) => (
          <LogSection key={entry.version} entry={entry} defaultOpen={i === 0} />
        ))}
      </div>

      {!embedded && (
        <div className="flex flex-col gap-0.5 pt-3 border-t border-zinc-800/40 mt-3">
          <p className="text-xs text-zinc-600 font-mono">Pilot: Stěhování Praha</p>
          <p className="text-xs text-zinc-700 font-mono">Next.js 16 · shadcn/ui · TS</p>
        </div>
      )}
    </div>
  )
}

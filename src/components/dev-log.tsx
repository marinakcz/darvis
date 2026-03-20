"use client"

import { useState } from "react"
import Image from "next/image"
import { Check, Circle } from "lucide-react"

interface LogItem {
  text: string
  description: string
}

interface LogEntry {
  version: string
  date: string
  status: "done" | "in-progress" | "planned"
  title: string
  summary: string
  items: LogItem[]
}

const LOG_ENTRIES: LogEntry[] = [
  {
    version: "0.1.0",
    date: "20. 3. 2026",
    status: "done",
    title: "Kalkulační wizard",
    summary: "Technik projde byt, naťuká položky, klient vidí cenu.",
    items: [
      { text: "4-krokový wizard", description: "Zakázka → Inventář → Kalkulace → Nabídka. Celý flow na tabletu u klienta." },
      { text: "Formulář zakázky", description: "Klient (jméno, tel, email), nakládka a vykládka (adresa, patro, výtah), vzdálenost, termín." },
      { text: "Katalog ~40 položek", description: "Reálné objemy v m³ — nábytek, elektronika, křehké, ostatní. Hodnoty od Stěhování Praha." },
      { text: "Room & item picker", description: "9 typů místností s ikonami. Katalog s filtry, hledáním, quantity +/-, toggles demontáž/balení/montáž." },
      { text: "Live kalkulace", description: "Running total m³ v headeru. Objem → auta → pracovníci → hodiny → cena s breakdownem." },
      { text: "Nabídka + sdílení", description: "Čistá stránka s cenou, rozsahem práce, soupisem položek. Sdílení přes Web Share API." },
      { text: "Offline-ready", description: "Data v localStorage — přežijí refresh. Technik se může vrátit k rozpracované zakázce." },
    ],
  },
  {
    version: "0.2.0",
    date: "další sprint",
    status: "planned",
    title: "Auth & zakázky",
    summary: "Přihlášení, seznam zakázek, databáze.",
    items: [
      { text: "Login technika", description: "Login screen pro techniky. Zatím mockup, později auth provider." },
      { text: "Seznam zakázek", description: "Dashboard — stav, klient, datum, cena." },
      { text: "Neon Postgres", description: "Serverless DB nahradí localStorage." },
    ],
  },
  {
    version: "0.3.0",
    date: "později",
    status: "planned",
    title: "PDF & sdílení",
    summary: "PDF nabídky, sdílení odkazem, podpis.",
    items: [
      { text: "PDF export", description: "PDF s firemní hlavičkou, číslem nabídky, podmínkami." },
      { text: "Odkaz pro klienta", description: "Unikátní URL. Klient otevře bez přihlášení." },
      { text: "Podpis na tabletu", description: "Klient podepíše prstem přímo na místě." },
    ],
  },
]

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
  planned: {
    dot: "bg-zinc-600",
    label: "Plán",
    labelClass: "text-zinc-500",
    border: "border-zinc-800 hover:border-zinc-700",
    bg: "bg-zinc-800/30",
    check: "text-zinc-600",
  },
}

function ItemDetail({ item, status }: { item: LogItem; status: LogEntry["status"] }) {
  const [open, setOpen] = useState(false)
  const config = STATUS_CONFIG[status]

  return (
    <div
      onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
      className="flex gap-2 pl-1 cursor-pointer rounded-md px-2 py-1.5 -mx-2 transition-colors hover:bg-zinc-800/40"
    >
      <span className={`mt-[2px] shrink-0 ${config.check}`}>
        {status === "done" ? <Check className="size-3.5" /> : <Circle className="size-3" />}
      </span>
      <div className="flex flex-col gap-0 flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-medium text-zinc-200 flex-1">
            {item.text}
          </span>
          <span className="text-[10px] text-zinc-700 shrink-0">
            {open ? "▾" : "▸"}
          </span>
        </div>
        {open && (
          <span className="text-[12px] leading-relaxed text-zinc-500 pt-0.5">
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
      {/* Phase header — clickable */}
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 p-4 cursor-pointer"
      >
        <div className={`h-2.5 w-2.5 rounded-full ${config.dot} shrink-0`} />
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold text-zinc-100">
              {entry.title}
            </span>
            <span className="text-[11px] font-mono text-zinc-600">
              v{entry.version}
            </span>
            <span className={`text-[11px] font-medium ${config.labelClass}`}>
              {config.label}
            </span>
          </div>
          <p className="text-[12px] text-zinc-500 mt-0.5">
            {entry.summary}
          </p>
        </div>
        <span className="text-xs text-zinc-700 shrink-0">
          {open ? "▾" : "▸"}
        </span>
      </div>

      {/* Steps — level 2 collapsible */}
      {open && (
        <div className="flex flex-col border-t border-zinc-800/50 mx-4 mb-3 pt-1">
          {entry.items.map((item, i) => (
            <ItemDetail key={i} item={item} status={entry.status} />
          ))}
        </div>
      )}
    </div>
  )
}

export function DevLog({ embedded = false }: { embedded?: boolean }) {
  return (
    <div className={`flex flex-col overflow-x-hidden ${embedded ? "" : "p-5 h-full"}`}>
      {/* Header — only in standalone mode */}
      {!embedded && (
        <div className="flex items-center gap-3 pb-4">
          <Image
            src="/logo.svg"
            alt="Darvis"
            width={110}
            height={30}
            className="h-5 w-auto opacity-70"
          />
          <span className="text-[11px] text-zinc-600 uppercase tracking-[0.15em] font-medium">
            Dev log
          </span>
        </div>
      )}

      {/* Entries */}
      <div className="flex flex-col gap-2.5 flex-1">
        {LOG_ENTRIES.map((entry, i) => (
          <LogSection
            key={entry.version}
            entry={entry}
            defaultOpen={i === 0}
          />
        ))}
      </div>

      {/* Footer — only in standalone mode */}
      {!embedded && (
        <div className="flex flex-col gap-0.5 pt-3 border-t border-zinc-800/40 mt-3">
          <p className="text-[11px] text-zinc-600 font-mono">
            Pilot: Stěhování Praha
          </p>
          <p className="text-[11px] text-zinc-700 font-mono">
            Next.js 16 · shadcn/ui · TS
          </p>
        </div>
      )}
    </div>
  )
}

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

const LOG_ENTRIES: LogEntry[] = [
  {
    version: "0.1.0",
    date: "20. 3. 2026",
    status: "done",
    title: "Kalkulační wizard",
    summary: "Dva režimy zaměření, katalog položek, kalkulace, nabídka.",
    items: [
      { text: "Dva režimy zaměření", description: "Rychlý odhad (% za místnost) pro Martina, detailní soupis položek pro Richarda." },
      { text: "5 typů zakázek", description: "Byt/dům, kancelář, těžké břemeno, umělecké předměty, mezinárodní." },
      { text: "5 vozů z reálného ceníku", description: "15–36 m³ s hodinovými sazbami přímo od Stěhování Praha." },
      { text: "Katalog 40+ položek", description: "Reálné objemy v m³ — nábytek, elektronika, křehké, ostatní. Závislosti (postel → matrace)." },
      { text: "Materiálový krok", description: "Krabice, přepravky, stretch fólie, bublinková fólie, balící papír." },
      { text: "Live kalkulace", description: "Objem → auta → pracovníci → hodiny → cena. Výběr vozu s doporučením." },
      { text: "Nabídka pro klienta", description: "Rozpis ceny, soupis položek, rozsah práce, sdílení." },
    ],
  },
  {
    version: "0.1.1",
    date: "20. 3. 2026",
    status: "done",
    title: "Klientské prostředí",
    summary: "Feedback, komentáře, admin, PWA, iOS design.",
    items: [
      { text: "Zpětná vazba", description: "5 typů (Chci tohle, Změnit, Nechápu, Chybí mi, Líbí se) + pin komentáře přímo v prototypu." },
      { text: "Admin dashboard", description: "PIN přístup, filtry, stavy (nový/přečtený/řeší se/hotovo), poznámky, export, mazání." },
      { text: "Tab bar + Kalendář + Profil", description: "Mobilní navigace — zakázky, kalendář, nová zakázka, profil technika." },
      { text: "PWA", description: "Instalovatelná na homescreen, offline-ready, iOS safe areas, standalone mode." },
      { text: "iOS design systém", description: "44px touch targety, 12px typografie, 8pt grid, 12px border radii, safe areas." },
      { text: "Přístupová ochrana", description: "PIN kód pro vstup do prototypu, admin PIN, serverová ochrana přes proxy." },
    ],
  },
  {
    version: "0.2.0",
    date: "další sprint",
    status: "ready",
    title: "Auth & databáze",
    summary: "Přihlášení techniků, reálná data, klientská zóna.",
    items: [
      { text: "Přihlášení technika", description: "Login screen, role (obchodník, dispečer, technik)." },
      { text: "Neon Postgres", description: "Serverless databáze — zakázky, klienti, nabídky." },
      { text: "Reálný CRUD", description: "Vytváření, úprava, mazání zakázek — ne mock data." },
      { text: "Klientská zóna", description: "Klient vidí timeline své zakázky (stav, milníky, dokumenty)." },
    ],
  },
  {
    version: "0.3.0",
    date: "plánováno",
    status: "ready",
    title: "CRM & Workflow",
    summary: "Stavový model zakázky, timeline eventů, pipeline.",
    items: [
      { text: "Workflow zakázky", description: "Lead → Kontaktován → Zaměření → Nabídka → Schválení → Realizace → Fakturace → Zaplaceno." },
      { text: "Timeline eventů", description: "Každá akce = event. Audit log + UX vrstva. Klient vidí filtrovanou timeline." },
      { text: "Číselníky", description: "Služby, ceny, typy stěhování, příplatky — zdroj pravdy pro nabídky." },
      { text: "Pipeline dashboard", description: "Kanban view stavů zakázek pro dispečera." },
    ],
  },
  {
    version: "0.4.0",
    date: "plánováno",
    status: "ready",
    title: "Navigace & Logistika",
    summary: "Mapy, trasy, navigace do appek, tracking.",
    items: [
      { text: "Navigační deeplinky", description: "Tlačítko u adresy → Mapy.cz, Waze, Google Maps, Apple Maps." },
      { text: "Vizualizace trasy", description: "Centrála → nakládka → vykládka na mapě." },
      { text: "Automatický výpočet km", description: "API pro vzdálenost místo ručního zadávání." },
    ],
  },
  {
    version: "0.5.0",
    date: "plánováno",
    status: "ready",
    title: "PDF & Sdílení",
    summary: "PDF nabídky, odkaz pro klienta, podpis.",
    items: [
      { text: "PDF nabídka", description: "Firemní hlavička, číslo nabídky, podmínky, ke stažení nebo emailem." },
      { text: "Odkaz pro klienta", description: "Unikátní URL — klient otevře bez přihlášení." },
      { text: "Podpis na tabletu", description: "Klient podepíše prstem přímo na místě." },
    ],
  },
  {
    version: "0.6.0",
    date: "plánováno",
    status: "ready",
    title: "App Store",
    summary: "Nativní appka pro iOS a Android.",
    items: [
      { text: "Capacitor wrapper", description: "Nativní shell — stejný kód, nativní distribuce." },
      { text: "Kamera", description: "Focení položek při zaměření." },
      { text: "Push notifikace", description: "Nová zakázka, změna stavu, připomínky." },
      { text: "Offline-first", description: "Funguje bez signálu, sync po připojení." },
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
          {entry.status === "done" && (
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-zinc-800/30 pl-1">
              <CheckCircle2 className="size-3 text-emerald-500" />
              <span className="text-[11px] text-emerald-500/70 font-medium">Potvrzeno</span>
            </div>
          )}
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

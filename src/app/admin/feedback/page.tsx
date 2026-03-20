"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Target, Wrench, HelpCircle, Plus, ThumbsUp,
  Download, ArrowLeft, Check, Eye, Clock,
  Filter, Lock, LogOut, MapPin, Loader2,
} from "lucide-react"
import type { ComponentType } from "react"
import type { LucideProps } from "lucide-react"
import type { FeedbackEntry } from "@/lib/feedback"

const TYPE_CONFIG: Record<string, { label: string; color: string; Icon: ComponentType<LucideProps> }> = {
  want: { label: "Chci tohle", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", Icon: Target },
  change: { label: "Změnit", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", Icon: Wrench },
  confusing: { label: "Nechápu", color: "bg-red-500/10 text-red-400 border-red-500/20", Icon: HelpCircle },
  missing: { label: "Chybí mi", color: "bg-purple-500/10 text-purple-400 border-purple-500/20", Icon: Plus },
  love: { label: "Líbí se", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", Icon: ThumbsUp },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; Icon: ComponentType<LucideProps> }> = {
  new: { label: "Nový", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", Icon: Clock },
  read: { label: "Přečtený", color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20", Icon: Eye },
  "in-progress": { label: "Řeší se", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", Icon: Loader2 },
  done: { label: "Hotovo", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", Icon: Check },
}

type KindTab = "all" | "general" | "pin"

export default function AdminFeedbackPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [pinValue, setPinValue] = useState("")
  const [pinError, setPinError] = useState(false)

  const [entries, setEntries] = useState<FeedbackEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [filterType, setFilterType] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [kindTab, setKindTab] = useState<KindTab>("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Check auth on mount by trying to fetch (cookie will be sent automatically)
  if (!authChecked) {
    setAuthChecked(true)
    fetch("/api/feedback")
      .then((r) => r.json())
      .then((data: FeedbackEntry[]) => {
        // If we get entries with 'note' field, we're admin
        if (data.length > 0 && "note" in data[0]) {
          setAuthenticated(true)
          setEntries(data)
          setLoading(false)
          setLoaded(true)
        } else if (data.length === 0) {
          // Could be admin with no entries or public — try to verify
          // We'll show PIN screen
          setLoading(false)
        } else {
          setLoading(false)
        }
      })
      .catch(() => setLoading(false))
  }

  // Load data after PIN auth
  if (authenticated && !loaded) {
    setLoaded(true)
    fetch("/api/feedback")
      .then((r) => r.json())
      .then((data: FeedbackEntry[]) => { setEntries(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  function handlePinSubmit() {
    if (pinValue.length < 1) return
    fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: pinValue }),
    }).then((res) => {
      if (res.ok) {
        setAuthenticated(true)
      } else {
        setPinError(true)
        setPinValue("")
      }
    })
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" })
    setAuthenticated(false)
    setLoaded(false)
    setEntries([])
    setAuthChecked(false)
    setPinValue("")
  }

  // PIN screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-200 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 w-full max-w-sm px-6">
          <Lock className="size-8 text-zinc-600" />
          <h1 className="text-xl font-semibold text-zinc-200">Admin</h1>
          <Input
            type="password"
            value={pinValue}
            onChange={(e) => { setPinValue(e.target.value); setPinError(false) }}
            onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
            placeholder="Kód"
            className="h-12 text-center text-lg tracking-widest"
            autoFocus
          />
          {pinError && <p className="text-sm text-red-400">Nesprávný kód</p>}
          <Button className="w-full h-11" onClick={handlePinSubmit} disabled={pinValue.length < 1}>
            Vstoupit
          </Button>
        </div>
      </div>
    )
  }

  const filtered = entries.filter((e) => {
    if (kindTab === "general" && e.kind !== "general") return false
    if (kindTab === "pin" && e.kind !== "pin") return false
    if (filterType && e.type !== filterType) return false
    if (filterStatus && e.status !== filterStatus) return false
    return true
  })

  const counts = {
    total: entries.length,
    general: entries.filter((e) => e.kind === "general").length,
    pin: entries.filter((e) => e.kind === "pin").length,
    new: entries.filter((e) => e.status === "new").length,
    read: entries.filter((e) => e.status === "read").length,
    "in-progress": entries.filter((e) => e.status === "in-progress").length,
    done: entries.filter((e) => e.status === "done").length,
  }

  const typeCounts = Object.fromEntries(
    Object.keys(TYPE_CONFIG).map((t) => [t, entries.filter((e) => e.type === t).length])
  )

  async function updateEntry(id: string, updates: { status?: string; note?: string; resolution?: string }) {
    await fetch("/api/feedback", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    })
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } as FeedbackEntry : e)))
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `darvis-feedback-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function contextLink(entry: FeedbackEntry): string | null {
    if (entry.kind !== "pin" || !entry.page) return null
    return entry.page
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-6">
          <div>
            <h1 className="text-xl font-bold">Zpětná vazba</h1>
            <p className="text-sm text-zinc-500">{counts.total} celkem</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={exportJSON}>
              <Download className="size-3.5" /> Export
            </Button>
            <a href="/survey?step=0" className="text-sm text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
              <ArrowLeft className="size-3.5" /> Demo
            </a>
            <Button variant="outline" size="sm" className="gap-1.5 text-red-400 hover:text-red-300" onClick={handleLogout}>
              <LogOut className="size-3.5" /> Odhlásit
            </Button>
          </div>
        </div>

        {/* Kind tabs */}
        <div className="flex gap-1 pb-4 border-b border-zinc-800 mb-4">
          {([
            { key: "all" as KindTab, label: "Vše", count: counts.total },
            { key: "general" as KindTab, label: "Obecná", count: counts.general },
            { key: "pin" as KindTab, label: "Piny", count: counts.pin },
          ]).map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setKindTab(key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                kindTab === key ? "bg-zinc-800 text-zinc-200" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
              }`}
            >
              {key === "pin" && <MapPin className="size-3.5" />}
              {label}
              <span className="font-mono text-xs text-zinc-600">{count}</span>
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 pb-4">
          <StatCard label="Nové" count={counts.new} active={filterStatus === "new"} onClick={() => setFilterStatus(filterStatus === "new" ? null : "new")} color="text-blue-400" />
          <StatCard label="Přečtené" count={counts.read} active={filterStatus === "read"} onClick={() => setFilterStatus(filterStatus === "read" ? null : "read")} color="text-zinc-400" />
          <StatCard label="Řeší se" count={counts["in-progress"]} active={filterStatus === "in-progress"} onClick={() => setFilterStatus(filterStatus === "in-progress" ? null : "in-progress")} color="text-amber-400" />
          <StatCard label="Hotovo" count={counts.done} active={filterStatus === "done"} onClick={() => setFilterStatus(filterStatus === "done" ? null : "done")} color="text-emerald-400" />
        </div>

        {/* Type filters (only for general tab or all) */}
        {kindTab !== "pin" && (
          <div className="flex items-center gap-1.5 pb-4 flex-wrap">
            <Filter className="size-3.5 text-zinc-600 mr-1" />
            {Object.entries(TYPE_CONFIG).map(([key, { label, Icon }]) => (
              <button
                key={key}
                onClick={() => setFilterType(filterType === key ? null : key)}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  filterType === key ? "bg-zinc-700 text-zinc-200" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                <Icon className="size-3" />
                {label}
                {typeCounts[key] > 0 && <span className="font-mono text-zinc-600 ml-0.5">{typeCounts[key]}</span>}
              </button>
            ))}
          </div>
        )}

        {/* Loading / Empty */}
        {loading && <div className="rounded-lg border border-zinc-800 p-8 text-center text-zinc-500">Načítám...</div>}
        {!loading && filtered.length === 0 && (
          <div className="rounded-lg border border-zinc-800 p-8 text-center text-zinc-500">
            {entries.length === 0 ? "Zatím žádná zpětná vazba." : "Žádné výsledky pro tento filtr."}
          </div>
        )}

        {/* Entries */}
        {!loading && (
          <div className="flex flex-col gap-2">
            {filtered.map((entry) => {
              const isPin = entry.kind === "pin"
              const typeConf = entry.type ? (TYPE_CONFIG[entry.type] ?? { label: entry.type, color: "bg-zinc-800 text-zinc-400", Icon: HelpCircle }) : null
              const statusConf = STATUS_CONFIG[entry.status] ?? STATUS_CONFIG.new
              const date = new Date(entry.createdAt)
              const isExpanded = expandedId === entry.id
              const link = contextLink(entry)

              return (
                <div
                  key={entry.id}
                  className={`rounded-lg border p-4 transition-colors cursor-pointer ${
                    entry.status === "new" ? "border-blue-500/20 bg-blue-500/5" : "border-zinc-800"
                  }`}
                  onClick={() => {
                    setExpandedId(isExpanded ? null : entry.id)
                    if (entry.status === "new") updateEntry(entry.id, { status: "read" })
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isPin && (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                          <MapPin className="size-3 mr-1" />
                          Pin
                        </Badge>
                      )}
                      {typeConf && (() => {
                        const TypeIcon = typeConf.Icon
                        return (
                          <Badge variant="outline" className={typeConf.color}>
                            <TypeIcon className="size-3 mr-1" />
                            {typeConf.label}
                          </Badge>
                        )
                      })()}
                      <Badge variant="outline" className={statusConf.color}>{statusConf.label}</Badge>
                      {entry.author && <span className="text-xs text-zinc-500">{entry.author}</span>}
                    </div>
                    <span className="text-xs text-zinc-600 font-mono shrink-0">
                      {date.toLocaleDateString("cs-CZ")} {date.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed">{entry.message}</p>

                  {/* Pin position info */}
                  {isPin && entry.x !== null && entry.y !== null && (
                    <p className="mt-1 text-xs text-zinc-600 font-mono">
                      x: {entry.x.toFixed(1)}% y: {entry.y.toFixed(0)}px
                    </p>
                  )}

                  {entry.page && <p className="mt-1 text-xs text-zinc-600 font-mono">{entry.page}</p>}

                  {/* Context link for pins */}
                  {isPin && link && (
                    <a
                      href={link}
                      className="mt-1 text-xs text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Eye className="size-3" />
                      Zobrazit v kontextu
                    </a>
                  )}

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-zinc-800 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-zinc-500">Stav:</span>
                        {(["new", "read", "in-progress", "done"] as const).map((s) => {
                          const sc = STATUS_CONFIG[s]
                          const SI = sc.Icon
                          return (
                            <button key={s} onClick={() => updateEntry(entry.id, { status: s })}
                              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${entry.status === s ? "bg-zinc-700 text-zinc-200" : "text-zinc-500 hover:bg-zinc-800"}`}>
                              <SI className="size-3" />{sc.label}
                            </button>
                          )
                        })}
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-zinc-500">Poznámka:</span>
                        <textarea
                          value={entry.note || ""}
                          onChange={(e) => setEntries((prev) => prev.map((en) => en.id === entry.id ? { ...en, note: e.target.value } : en))}
                          onBlur={(e) => updateEntry(entry.id, { note: e.target.value })}
                          placeholder="Přidat interní poznámku..."
                          rows={2}
                          className="w-full resize-none rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-zinc-500">Řešení:</span>
                        <textarea
                          value={entry.resolution || ""}
                          onChange={(e) => setEntries((prev) => prev.map((en) => en.id === entry.id ? { ...en, resolution: e.target.value } : en))}
                          onBlur={(e) => updateEntry(entry.id, { resolution: e.target.value })}
                          placeholder="Jak bylo vyřešeno..."
                          rows={2}
                          className="w-full resize-none rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, count, active, onClick, color }: {
  label: string; count: number; active: boolean; onClick: () => void; color: string
}) {
  return (
    <button onClick={onClick}
      className={`flex flex-col items-center gap-0.5 rounded-lg border p-3 transition-colors ${active ? "border-zinc-600 bg-zinc-800/50" : "border-zinc-800 hover:bg-zinc-800/30"}`}>
      <span className={`font-mono text-xl font-bold ${color}`}>{count}</span>
      <span className="text-[11px] text-zinc-500">{label}</span>
    </button>
  )
}

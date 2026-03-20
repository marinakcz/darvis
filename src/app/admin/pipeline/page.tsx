"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Check, Circle, Clock, Loader2, Plus, Lock, LogOut,
  MessageSquare, ChevronDown, ChevronRight, X,
  Sparkles, Bug, RefreshCw,
} from "lucide-react"
import type { ComponentType } from "react"
import type { LucideProps } from "lucide-react"
interface ReleaseNote {
  id: string
  version: string
  date: string
  title: string
  description: string
  type: "feature" | "fix" | "change"
}

/* ── Pipeline types (matching dev-log.tsx) ── */

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

/* ── Status config ── */

const PHASE_STATUS: Record<string, { label: string; color: string; Icon: ComponentType<LucideProps> }> = {
  ready: { label: "Pripraveno", color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20", Icon: Circle },
  "in-progress": { label: "Probiha", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", Icon: Clock },
  done: { label: "Hotovo", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", Icon: Check },
}

const NOTE_TYPE_CONFIG: Record<string, { Icon: typeof Sparkles; color: string; label: string }> = {
  feature: { Icon: Sparkles, color: "text-blue-400", label: "Feature" },
  fix: { Icon: Bug, color: "text-red-400", label: "Fix" },
  change: { Icon: RefreshCw, color: "text-amber-400", label: "Change" },
}

/* ── Page ── */

export default function AdminPipelinePage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [pinDigits, setPinDigits] = useState(["", "", "", ""])
  const [pinError, setPinError] = useState(false)

  const [pipeline, setPipeline] = useState<LogEntry[]>([])
  const [notes, setNotes] = useState<ReleaseNote[]>([])
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Add note form
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [noteVersion, setNoteVersion] = useState("")
  const [noteTitle, setNoteTitle] = useState("")
  const [noteDescription, setNoteDescription] = useState("")
  const [noteType, setNoteType] = useState<"feature" | "fix" | "change">("feature")

  // Check auth on mount
  if (!authChecked) {
    setAuthChecked(true)
    fetch("/api/pipeline?type=all")
      .then((r) => {
        if (!r.ok) throw new Error("unauth")
        return r.json()
      })
      .then((data: { pipeline: LogEntry[]; notes: ReleaseNote[] }) => {
        // GET is public, so we need to verify admin by trying a PUT
        return fetch("/api/pipeline", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "check" }),
        }).then((putRes) => {
          if (putRes.status === 401) {
            // Not admin
            setLoading(false)
          } else {
            // Admin (400 = invalid type but authorized)
            setAuthenticated(true)
            setPipeline(Array.isArray(data.pipeline) ? data.pipeline : [])
            setNotes(Array.isArray(data.notes) ? data.notes : [])
            setLoading(false)
            setLoaded(true)
          }
        })
      })
      .catch(() => setLoading(false))
  }

  // Load data after PIN auth
  if (authenticated && !loaded) {
    setLoaded(true)
    fetch("/api/pipeline?type=all")
      .then((r) => r.json())
      .then((data: { pipeline: LogEntry[]; notes: ReleaseNote[] }) => {
        setPipeline(Array.isArray(data.pipeline) ? data.pipeline : [])
        setNotes(Array.isArray(data.notes) ? data.notes : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  function handlePinInput(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1)
    const next = [...pinDigits]
    next[index] = digit
    setPinDigits(next)
    setPinError(false)

    if (digit && index < 3) {
      document.getElementById(`adm-${index + 1}`)?.focus()
    }

    const fullPin = next.join("")
    if (fullPin.length === 4 && next.every((d) => d !== "")) {
      fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: fullPin }),
      }).then((res) => {
        if (res.ok) {
          setAuthenticated(true)
        } else {
          setPinError(true)
          setPinDigits(["", "", "", ""])
          setTimeout(() => document.getElementById("adm-0")?.focus(), 50)
        }
      })
    }
  }

  function handlePinKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !pinDigits[index] && index > 0) {
      document.getElementById(`adm-${index - 1}`)?.focus()
      const next = [...pinDigits]
      next[index - 1] = ""
      setPinDigits(next)
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" })
    setAuthenticated(false)
    setLoaded(false)
    setPipeline([])
    setNotes([])
    setAuthChecked(false)
    setPinDigits(["", "", "", ""])
  }

  async function updatePhaseStatus(version: string, newStatus: LogEntry["status"]) {
    setSaving(true)
    const updated = pipeline.map((p) =>
      p.version === version ? { ...p, status: newStatus } : p
    )
    setPipeline(updated)

    await fetch("/api/pipeline", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "pipeline", data: updated }),
    })
    setSaving(false)
  }

  async function addNote() {
    if (!noteVersion.trim() || !noteTitle.trim() || !noteDescription.trim()) return
    setSaving(true)

    const newNote: ReleaseNote = {
      id: `rn-${Date.now()}`,
      version: noteVersion.trim(),
      date: new Date().toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" }),
      title: noteTitle.trim(),
      description: noteDescription.trim(),
      type: noteType,
    }

    const updated = [newNote, ...notes]
    setNotes(updated)

    await fetch("/api/pipeline", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "notes", data: updated }),
    })

    setNoteVersion("")
    setNoteTitle("")
    setNoteDescription("")
    setNoteType("feature")
    setShowNoteForm(false)
    setSaving(false)
  }

  async function deleteNote(id: string) {
    setSaving(true)
    const updated = notes.filter((n) => n.id !== id)
    setNotes(updated)

    await fetch("/api/pipeline", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "notes", data: updated }),
    })
    setSaving(false)
  }

  // PIN screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-200 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 w-full max-w-sm px-6">
          <Lock className="size-8 text-zinc-600" />
          <h1 className="text-xl font-semibold text-zinc-200">Admin</h1>

          <div className="flex gap-3">
            {pinDigits.map((digit, i) => (
              <input
                key={i}
                id={`adm-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit ? "\u2022" : ""}
                onChange={(e) => handlePinInput(i, e.target.value)}
                onKeyDown={(e) => handlePinKeyDown(i, e)}
                autoFocus={i === 0}
                className={`w-12 h-14 text-center text-xl rounded-xl border-2 bg-zinc-900 outline-none transition-all ${
                  pinError
                    ? "border-red-500/50 bg-red-500/5"
                    : digit
                      ? "border-zinc-500 bg-zinc-800"
                      : "border-zinc-700 focus:border-zinc-500"
                }`}
              />
            ))}
          </div>

          {pinError && <p className="text-sm text-red-400">Nespravny kod</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-6">
          <div>
            <h1 className="text-xl font-bold">Pipeline</h1>
            <p className="text-sm text-zinc-500">{pipeline.length} fazi</p>
          </div>
          <div className="flex items-center gap-2">
            {saving && (
              <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Loader2 className="size-3 animate-spin" /> Ukladam...
              </span>
            )}
            <Button variant="outline" size="sm" className="gap-1.5 text-red-400 hover:text-red-300" onClick={handleLogout}>
              <LogOut className="size-3.5" /> Odhlasit
            </Button>
          </div>
        </div>

        {/* Admin nav */}
        <div className="flex gap-1 pb-4 border-b border-zinc-800 mb-6">
          <a
            href="/admin/feedback"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors min-h-[44px]"
          >
            <MessageSquare className="size-3.5" />
            Zpetna vazba
          </a>
          <span
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium bg-zinc-800 text-zinc-200 min-h-[44px]"
          >
            <Clock className="size-3.5" />
            Pipeline
          </span>
        </div>

        {/* Loading */}
        {loading && <div className="rounded-lg border border-zinc-800 p-8 text-center text-zinc-500">Nacitam...</div>}

        {/* Pipeline phases */}
        {!loading && (
          <div className="flex flex-col gap-3 mb-8">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Faze projektu</h2>
            {pipeline.length === 0 && (
              <div className="rounded-lg border border-zinc-800 p-8 text-center text-zinc-500">
                Zadna data v pipeline.
              </div>
            )}
            {pipeline.map((phase) => {
              const statusConf = PHASE_STATUS[phase.status] ?? PHASE_STATUS.ready
              const StatusIcon = statusConf.Icon
              const isExpanded = expandedPhase === phase.version

              return (
                <div
                  key={phase.version}
                  className="rounded-lg border border-zinc-800 overflow-hidden"
                >
                  {/* Phase header */}
                  <div
                    onClick={() => setExpandedPhase(isExpanded ? null : phase.version)}
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-zinc-800/30 transition-colors min-h-[44px]"
                  >
                    {isExpanded
                      ? <ChevronDown className="size-4 text-zinc-500 shrink-0" />
                      : <ChevronRight className="size-4 text-zinc-500 shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-zinc-500">v{phase.version}</span>
                        <span className="text-sm font-semibold text-zinc-200">{phase.title}</span>
                        <Badge variant="outline" className={statusConf.color}>
                          <StatusIcon className="size-3 mr-1" />
                          {statusConf.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">{phase.summary}</p>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="border-t border-zinc-800 p-4 flex flex-col gap-4">
                      {/* Items */}
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-zinc-500 font-medium mb-1">Polozky:</span>
                        {phase.items.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 py-1.5 min-h-[44px]">
                            <span className={`mt-[2px] shrink-0 ${phase.status === "done" ? "text-emerald-500" : "text-zinc-500"}`}>
                              {phase.status === "done" ? <Check className="size-3.5" /> : <Circle className="size-3" />}
                            </span>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm text-zinc-200">{item.text}</span>
                              <span className="text-xs text-zinc-500">{item.description}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Status change buttons */}
                      <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
                        <span className="text-xs text-zinc-500 font-medium">Zmenit stav:</span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => updatePhaseStatus(phase.version, "ready")}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors min-h-[44px] ${
                              phase.status === "ready"
                                ? "bg-zinc-700 text-zinc-200 ring-1 ring-zinc-500"
                                : "text-zinc-400 hover:bg-zinc-800 border border-zinc-700"
                            }`}
                          >
                            <Circle className="size-3.5" />
                            Pripraveno
                          </button>
                          <button
                            type="button"
                            onClick={() => updatePhaseStatus(phase.version, "in-progress")}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors min-h-[44px] ${
                              phase.status === "in-progress"
                                ? "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/40"
                                : "text-zinc-400 hover:bg-zinc-800 border border-zinc-700"
                            }`}
                          >
                            <Clock className="size-3.5" />
                            Probiha
                          </button>
                          <button
                            type="button"
                            onClick={() => updatePhaseStatus(phase.version, "done")}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors min-h-[44px] ${
                              phase.status === "done"
                                ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/40"
                                : "text-zinc-400 hover:bg-zinc-800 border border-zinc-700"
                            }`}
                          >
                            <Check className="size-3.5" />
                            Hotovo
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Release Notes section */}
        {!loading && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Release Notes</h2>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setShowNoteForm(!showNoteForm)}
              >
                {showNoteForm ? <X className="size-3.5" /> : <Plus className="size-3.5" />}
                {showNoteForm ? "Zrusit" : "Pridat poznamku"}
              </Button>
            </div>

            {/* Add note form */}
            {showNoteForm && (
              <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-4 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-zinc-500">Verze</label>
                    <input
                      type="text"
                      value={noteVersion}
                      onChange={(e) => setNoteVersion(e.target.value)}
                      placeholder="0.1.6"
                      className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none min-h-[44px]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-zinc-500">Typ</label>
                    <div className="flex gap-1">
                      {(["feature", "fix", "change"] as const).map((t) => {
                        const conf = NOTE_TYPE_CONFIG[t]
                        const TypeIcon = conf.Icon
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setNoteType(t)}
                            className={`flex items-center gap-1 rounded-md px-2 py-2 text-xs font-medium transition-colors min-h-[44px] ${
                              noteType === t ? "bg-zinc-700 text-zinc-200" : "text-zinc-500 hover:bg-zinc-800"
                            }`}
                          >
                            <TypeIcon className="size-3" />
                            {conf.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-zinc-500">Nazev</label>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Nazev release..."
                    className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none min-h-[44px]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-zinc-500">Popis</label>
                  <textarea
                    value={noteDescription}
                    onChange={(e) => setNoteDescription(e.target.value)}
                    placeholder="Co je noveho..."
                    rows={3}
                    className="w-full resize-none rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="self-end gap-1.5"
                  onClick={addNote}
                  disabled={saving || !noteVersion.trim() || !noteTitle.trim() || !noteDescription.trim()}
                >
                  {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                  Pridat
                </Button>
              </div>
            )}

            {/* Notes list */}
            {notes.length === 0 && (
              <div className="rounded-lg border border-zinc-800 p-8 text-center text-zinc-500">
                Zadne release notes.
              </div>
            )}
            {notes.map((note) => {
              const typeConf = NOTE_TYPE_CONFIG[note.type] ?? NOTE_TYPE_CONFIG.feature
              const TypeIcon = typeConf.Icon
              return (
                <div key={note.id} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs font-mono text-zinc-500">v{note.version}</span>
                      <span className="text-zinc-700">·</span>
                      <span className="text-xs text-zinc-500">{note.date}</span>
                      <span className="text-zinc-700">·</span>
                      <span className={`flex items-center gap-1 text-xs ${typeConf.color}`}>
                        <TypeIcon className="size-3" />
                        {typeConf.label}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteNote(note.id)}
                      className="text-zinc-600 hover:text-red-400 transition-colors p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-200 mb-1">{note.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{note.description}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

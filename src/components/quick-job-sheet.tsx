"use client"

import { useState, useRef, useCallback } from "react"
import { X, Search, UserPlus, Loader2 } from "lucide-react"

interface Customer {
  id: string
  name: string
  phone: string
  email: string | null
  jobCount: number
}

interface QuickJobSheetProps {
  open: boolean
  onClose: () => void
  onCreated: (jobId: string) => void
}

export function QuickJobSheet({ open, onClose, onCreated }: QuickJobSheetProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Customer[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [newClient, setNewClient] = useState({ name: "", phone: "", email: "" })
  const [isNewClient, setIsNewClient] = useState(false)
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [note, setNote] = useState("")
  const [creating, setCreating] = useState(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const searchCustomers = useCallback((q: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (q.length < 2) { setResults([]); setSearching(false); return }
    setSearching(true)
    searchTimer.current = setTimeout(() => {
      fetch(`/api/customers/search?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((data) => { setResults(Array.isArray(data) ? data : []); setSearching(false) })
        .catch(() => { setResults([]); setSearching(false) })
    }, 300)
  }, [])

  function handleQueryChange(value: string) {
    setQuery(value)
    setSelectedCustomer(null)
    setIsNewClient(false)
    searchCustomers(value)
  }

  function selectCustomer(customer: Customer) {
    setSelectedCustomer(customer)
    setQuery(customer.name)
    setResults([])
    setIsNewClient(false)
  }

  function startNewClient() {
    setIsNewClient(true)
    setSelectedCustomer(null)
    setNewClient({ name: query, phone: "", email: "" })
    setResults([])
  }

  async function handleCreate() {
    setCreating(true)
    try {
      const client = selectedCustomer
        ? { name: selectedCustomer.name, phone: selectedCustomer.phone, email: selectedCustomer.email || "" }
        : isNewClient
        ? newClient
        : null

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobType: "apartment",
          client: client?.name && client?.phone ? client : undefined,
          date: date || undefined,
          time: time || undefined,
          dispatcherNote: note || undefined,
        }),
      })
      if (res.ok) {
        const { id } = await res.json()
        onCreated(id)
        resetForm()
      }
    } catch { /* ignore */ }
    setCreating(false)
  }

  function resetForm() {
    setQuery("")
    setResults([])
    setSelectedCustomer(null)
    setIsNewClient(false)
    setNewClient({ name: "", phone: "", email: "" })
    setDate("")
    setNote("")
  }

  if (!open) return null

  const canCreate = selectedCustomer || (isNewClient && newClient.name && newClient.phone) || (!selectedCustomer && !isNewClient)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full max-w-lg bg-surface-0 rounded-t-3xl pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3">
          <h2 className="text-lg font-semibold">Nová zakázka</h2>
          <button type="button" onClick={onClose} aria-label="Zavřít"
            className="flex items-center justify-center size-9 rounded-lg text-text-secondary hover:bg-surface-2 transition-colors">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex flex-col gap-3 px-4 pb-6 max-h-[70vh] overflow-y-auto">
          {/* Client search */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-text-tertiary uppercase tracking-wider">Klient</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-tertiary" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Jméno nebo telefon..."
                autoFocus
                className="w-full h-12 rounded-xl bg-surface-1 pl-10 pr-4 text-sm outline-none placeholder:text-text-tertiary focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors"
              />
              {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-text-tertiary" />}
            </div>

            {/* Search results */}
            {results.length > 0 && (
              <div className="rounded-xl bg-surface-1 overflow-hidden divide-y divide-border">
                {results.map((c) => (
                  <button key={c.id} type="button" onClick={() => selectCustomer(c)}
                    className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-surface-2 active:bg-surface-2 transition-colors min-h-[44px]">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{c.name}</span>
                      <span className="text-xs text-text-tertiary">{c.phone}</span>
                    </div>
                    {c.jobCount > 0 && (
                      <span className="text-[10px] text-text-tertiary bg-surface-2 px-1.5 py-0.5 rounded">
                        {c.jobCount}× zakázka
                      </span>
                    )}
                  </button>
                ))}
                <button type="button" onClick={startNewClient}
                  className="flex items-center gap-2 w-full px-4 py-3 text-left text-sm text-success hover:bg-surface-2 active:bg-surface-2 transition-colors min-h-[44px]">
                  <UserPlus className="size-4" />
                  Nový klient „{query}"
                </button>
              </div>
            )}

            {/* No results — offer new client */}
            {query.length >= 2 && !searching && results.length === 0 && !selectedCustomer && !isNewClient && (
              <button type="button" onClick={startNewClient}
                className="flex items-center gap-2 rounded-xl bg-surface-1 px-4 py-3 text-sm text-success hover:bg-surface-2 transition-colors min-h-[44px]">
                <UserPlus className="size-4" />
                Vytvořit klienta „{query}"
              </button>
            )}

            {/* Selected customer badge */}
            {selectedCustomer && (
              <div className="flex items-center gap-2 rounded-xl bg-success/10 px-4 py-2.5">
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-medium text-success">{selectedCustomer.name}</span>
                  <span className="text-xs text-text-secondary">{selectedCustomer.phone}</span>
                </div>
                <button type="button" onClick={() => { setSelectedCustomer(null); setQuery("") }}
                  className="text-xs text-text-tertiary hover:text-text-secondary">Změnit</button>
              </div>
            )}

            {/* New client form */}
            {isNewClient && (
              <div className="flex flex-col gap-2 rounded-xl bg-surface-1 p-3">
                <input type="text" value={newClient.name}
                  onChange={(e) => setNewClient((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Jméno *"
                  className="h-11 rounded-lg bg-surface-2 px-3 text-sm outline-none placeholder:text-text-tertiary focus-visible:ring-2 focus-visible:ring-ring/50" />
                <input type="tel" inputMode="tel" value={newClient.phone}
                  onChange={(e) => setNewClient((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="Telefon *"
                  className="h-11 rounded-lg bg-surface-2 px-3 text-sm outline-none placeholder:text-text-tertiary focus-visible:ring-2 focus-visible:ring-ring/50" />
                <input type="email" inputMode="email" value={newClient.email}
                  onChange={(e) => setNewClient((p) => ({ ...p, email: e.target.value }))}
                  placeholder="Email (volitelný)"
                  className="h-11 rounded-lg bg-surface-2 px-3 text-sm outline-none placeholder:text-text-tertiary focus-visible:ring-2 focus-visible:ring-ring/50" />
              </div>
            )}
          </div>

          {/* Date + Time */}
          <div className="flex gap-2">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs text-text-tertiary uppercase tracking-wider">Kdy</label>
              <input type="date" value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12 rounded-xl bg-surface-1 px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5 w-28">
              <label className="text-xs text-text-tertiary uppercase tracking-wider">Čas</label>
              <input type="time" value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-12 rounded-xl bg-surface-1 px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors" />
            </div>
          </div>

          {/* Note */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-text-tertiary uppercase tracking-wider">Poznámka</label>
            <textarea value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="2+1, Vinohrady, volal dopoledne..."
              rows={2}
              className="rounded-xl bg-surface-1 px-4 py-3 text-sm outline-none placeholder:text-text-tertiary focus-visible:ring-2 focus-visible:ring-ring/50 resize-y" />
          </div>

          {/* Create button */}
          <button type="button" onClick={handleCreate} disabled={creating || !canCreate}
            className="flex items-center justify-center gap-2 w-full h-14 rounded-2xl bg-success text-success-foreground font-semibold text-base transition-colors hover:bg-success/90 active:bg-success/85 disabled:opacity-40 disabled:pointer-events-none mt-1">
            {creating ? <Loader2 className="size-5 animate-spin" /> : null}
            Vytvořit zakázku
          </button>
        </div>
      </div>
    </div>
  )
}

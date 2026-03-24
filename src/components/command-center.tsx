"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { X, Search, ClipboardList, UserPlus, StickyNote, Loader2, ChevronRight, Phone } from "lucide-react"

interface SearchResult {
  type: "job" | "customer"
  id: string
  title: string
  subtitle: string
  href: string
  phone?: string
}

interface CommandCenterProps {
  open: boolean
  onClose: () => void
  onQuickJob?: () => void
}

export function CommandCenter({ open, onClose, onQuickJob }: CommandCenterProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback((q: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (q.length < 2) { setResults([]); setSearching(false); return }
    setSearching(true)
    searchTimer.current = setTimeout(async () => {
      try {
        const [jobsRes, customersRes] = await Promise.all([
          fetch("/api/jobs").then((r) => r.json()),
          fetch(`/api/customers/search?q=${encodeURIComponent(q)}`).then((r) => r.json()),
        ])

        const qLower = q.toLowerCase()
        const jobResults: SearchResult[] = (Array.isArray(jobsRes) ? jobsRes : [])
          .filter((j: Record<string, string | null>) =>
            (j.customerName || "").toLowerCase().includes(qLower) ||
            (j.pickupAddress || "").toLowerCase().includes(qLower) ||
            (j.deliveryAddress || "").toLowerCase().includes(qLower)
          )
          .slice(0, 5)
          .map((j: Record<string, string>): SearchResult => ({
            type: "job",
            id: j.id,
            title: j.customerName || "Nový klient",
            subtitle: `${(j.pickupAddress || "—").split(",")[0]} → ${(j.deliveryAddress || "—").split(",")[0]}`,
            href: `/jobs/${j.id}`,
          }))

        const customerResults: SearchResult[] = (Array.isArray(customersRes) ? customersRes : [])
          .slice(0, 5)
          .map((c: Record<string, string>): SearchResult => ({
            type: "customer",
            id: c.id,
            title: c.name,
            subtitle: c.phone,
            href: `/jobs?q=${encodeURIComponent(c.name)}`,
            phone: c.phone,
          }))

        setResults([...jobResults, ...customerResults])
      } catch { setResults([]) }
      setSearching(false)
    }, 250)
  }, [])

  function handleQueryChange(value: string) {
    setQuery(value)
    search(value)
  }

  function navigate(href: string) {
    onClose()
    setQuery("")
    setResults([])
    router.push(href)
  }

  function quickAction(action: string) {
    onClose()
    setQuery("")
    setResults([])
    if (action === "job" && onQuickJob) { onQuickJob(); return }
    if (action === "job") router.push("/jobs")
    if (action === "client") router.push("/jobs")
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Content — top sheet style */}
      <div className="relative w-full max-w-lg mx-auto bg-surface-0 rounded-b-3xl pt-[env(safe-area-inset-top)] animate-in slide-in-from-top duration-200">
        {/* Search bar */}
        <div className="flex items-center gap-2 px-4 pt-4 pb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-tertiary" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Hledat nebo vytvořit..."
              autoFocus
              className="w-full h-12 rounded-xl bg-surface-1 pl-10 pr-4 text-sm outline-none placeholder:text-text-tertiary focus-visible:ring-2 focus-visible:ring-ring/50"
            />
            {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-text-tertiary" />}
          </div>
          <button type="button" onClick={onClose} className="text-sm text-text-secondary px-2 py-2 min-h-[44px]">
            Zrušit
          </button>
        </div>

        <div className="flex flex-col pb-6 max-h-[70vh] overflow-y-auto">
          {/* Quick actions — shown when no query */}
          {query.length < 2 && (
            <div className="px-4">
              <span className="text-[10px] text-text-tertiary tracking-widest uppercase block mb-2">Rychlé akce</span>
              <div className="flex flex-col gap-1">
                <ActionRow icon={ClipboardList} label="Nová zakázka" hint="Vytvořit z hovoru nebo schůzky" onClick={() => quickAction("job")} />
                <ActionRow icon={UserPlus} label="Nový klient" hint="Přidat do databáze kontaktů" onClick={() => quickAction("client")} />
                <ActionRow icon={StickyNote} label="Poznámka" hint="Rychlá poznámka k zakázce" onClick={() => quickAction("note")} />
              </div>
            </div>
          )}

          {/* Search results */}
          {results.length > 0 && (
            <div className="px-4 mt-2">
              {results.filter((r) => r.type === "job").length > 0 && (
                <>
                  <span className="text-[10px] text-text-tertiary tracking-widest uppercase block mb-2">Zakázky</span>
                  <div className="rounded-xl bg-surface-1 overflow-hidden divide-y divide-border mb-3">
                    {results.filter((r) => r.type === "job").map((r) => (
                      <button key={r.id} type="button" onClick={() => navigate(r.href)}
                        className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-surface-2 active:bg-surface-2 transition-colors min-h-[44px]">
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm font-medium truncate">{r.title}</span>
                          <span className="text-xs text-text-tertiary truncate">{r.subtitle}</span>
                        </div>
                        <ChevronRight className="size-4 text-text-tertiary shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </>
              )}
              {results.filter((r) => r.type === "customer").length > 0 && (
                <>
                  <span className="text-[10px] text-text-tertiary tracking-widest uppercase block mb-2">Klienti</span>
                  <div className="rounded-xl bg-surface-1 overflow-hidden divide-y divide-border">
                    {results.filter((r) => r.type === "customer").map((r) => (
                      <button key={r.id} type="button" onClick={() => navigate(r.href)}
                        className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-surface-2 active:bg-surface-2 transition-colors min-h-[44px]">
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm font-medium">{r.title}</span>
                          <span className="text-xs text-text-tertiary">{r.subtitle}</span>
                        </div>
                        {r.phone && (
                          <a href={`tel:${r.phone.replace(/\s/g, "")}`} onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-center size-9 rounded-lg text-success hover:bg-success/10 transition-colors shrink-0 ml-2">
                            <Phone className="size-4" />
                          </a>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* No results */}
          {query.length >= 2 && !searching && results.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-text-secondary">Žádné výsledky pro „{query}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ActionRow({ icon: Icon, label, hint, onClick }: {
  icon: typeof ClipboardList; label: string; hint: string; onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-3 py-3 w-full text-left hover:bg-surface-1 active:bg-surface-1 transition-colors min-h-[44px]">
      <div className="flex items-center justify-center size-9 rounded-full bg-surface-1">
        <Icon className="size-4 text-text-secondary" />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-[11px] text-text-tertiary">{hint}</span>
      </div>
    </button>
  )
}

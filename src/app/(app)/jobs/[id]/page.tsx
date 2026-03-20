"use client"

import { use, useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { Zap, FileText, ChevronLeft, ChevronDown, ChevronUp, Navigation2, Phone } from "lucide-react"
import { NavigationSheet, useNavigationSheet } from "@/components/navigation-sheet"
import { Button } from "@/components/ui/button"
import { getMockJobById } from "@/lib/mock-data"
import type { SurveyMode } from "@/lib/types"

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const mounted = useIsMounted()
  const router = useRouter()
  const [crmExpanded, setCrmExpanded] = useState(false)
  const { navAddress, openNav, closeNav } = useNavigationSheet()

  if (!mounted) return null

  const selectedJob = getMockJobById(id)
  if (!selectedJob) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">Zakázka nenalezena.</p>
      </div>
    )
  }

  const dateFormatted = new Date(selectedJob.date).toLocaleDateString("cs-CZ", {
    weekday: "short", day: "numeric", month: "long",
  })

  const statusBg = selectedJob.statusColor === "text-blue-400" ? "bg-blue-400/15 text-blue-400" : selectedJob.statusColor === "text-green-400" ? "bg-green-400/15 text-green-400" : selectedJob.statusColor === "text-purple-400" ? "bg-purple-400/15 text-purple-400" : "bg-yellow-400/15 text-yellow-400"

  function handleStartSurvey(mode: SurveyMode) {
    router.push(`/jobs/${id}/survey?mode=${mode}`)
  }

  return (
    <div className="flex flex-1 flex-col ios-slide-in">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl px-4 py-2.5">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => router.push("/dashboard")} aria-label="Zpět na seznam zakázek" className="flex items-center gap-0.5 text-primary text-sm shrink-0">
            <ChevronLeft className="size-5" />
          </button>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-semibold truncate">{selectedJob.client}</span>
            <span className="text-[11px] text-muted-foreground truncate">{selectedJob.name.split(" — ")[1]}</span>
          </div>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${statusBg}`}>{selectedJob.statusLabel}</span>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 px-4 py-4">
        {/* Status badge + date */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold ${statusBg}`}>
            {selectedJob.statusLabel}
          </span>
          <span className="text-sm text-muted-foreground">{dateFormatted}</span>
        </div>

        {/* Collapsible CRM data */}
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => setCrmExpanded((prev) => !prev)}
            className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 min-h-[44px] w-full text-left transition-colors hover:bg-accent active:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span className="text-sm font-medium text-muted-foreground">Udaje zakazky</span>
            {crmExpanded ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
          </button>

          {crmExpanded && (
            <div className="rounded-2xl border border-border bg-muted/30 overflow-hidden divide-y divide-border">
              <div className="flex items-center justify-between px-4 py-2.5 min-h-[40px]">
                <span className="text-xs text-muted-foreground">Klient</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{selectedJob.client}</span>
                  <a href={`tel:${selectedJob.phone}`} className="flex items-center gap-1 text-primary text-xs hover:underline">
                    <Phone className="size-3" />
                    {selectedJob.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 px-4 py-2.5 min-h-[40px]">
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className="text-xs text-muted-foreground">Nakladka</span>
                  <span className="text-sm text-muted-foreground truncate">{selectedJob.pickup}</span>
                  <span className="text-xs text-muted-foreground/70">{selectedJob.floor.pickup}. patro{selectedJob.elevator.pickup ? " · vytah" : " · bez vytahu"}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); openNav(selectedJob.pickup) }}
                  className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-primary shrink-0 min-h-[36px] hover:bg-accent active:bg-accent transition-colors"
                >
                  <Navigation2 className="size-3.5" />
                  <span>Navigovat</span>
                </button>
              </div>
              <div className="flex items-center justify-between gap-2 px-4 py-2.5 min-h-[40px]">
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className="text-xs text-muted-foreground">Vykladka</span>
                  <span className="text-sm text-muted-foreground truncate">{selectedJob.delivery}</span>
                  <span className="text-xs text-muted-foreground/70">{selectedJob.floor.delivery}. patro{selectedJob.elevator.delivery ? " · vytah" : " · bez vytahu"}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); openNav(selectedJob.delivery) }}
                  className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-primary shrink-0 min-h-[36px] hover:bg-accent active:bg-accent transition-colors"
                >
                  <Navigation2 className="size-3.5" />
                  <span>Navigovat</span>
                </button>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 min-h-[40px]">
                <span className="text-xs text-muted-foreground">Vzdalenost</span>
                <span className="text-sm font-mono text-muted-foreground">{selectedJob.distance} km</span>
              </div>
            </div>
          )}
        </div>

        {/* Dispatcher note mock */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
          <p className="text-xs font-medium text-amber-400 mb-1">Poznamka dispecinku</p>
          <p className="text-sm text-muted-foreground">Klient preferuje dopoledni termin. Pozor na uzke schodiste ve 2. patre.</p>
        </div>

        {/* Price if exists */}
        {selectedJob.price !== "\u2014" && (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 min-h-[44px]">
              <span className="text-sm">Celkem</span>
              <span className="text-sm font-mono font-medium">{selectedJob.price}</span>
            </div>
          </div>
        )}

        {/* CTA buttons -- prominent */}
        {selectedJob.actionable && (
          <div className="flex flex-col gap-3 pt-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider px-1">Zahajit zamereni</p>
            <Button size="lg" className="h-14 text-base gap-2 rounded-2xl" onClick={() => handleStartSurvey("quick")}>
              <Zap className="size-5" /> Rychle zamereni
            </Button>
            <Button variant="outline" size="lg" className="h-14 text-base gap-2 rounded-2xl" onClick={() => handleStartSurvey("detailed")}>
              <FileText className="size-5" /> Detailni zamereni
            </Button>
          </div>
        )}
      </main>

      {/* Navigation sheet */}
      {navAddress && <NavigationSheet address={navAddress} onClose={closeNav} />}
    </div>
  )
}

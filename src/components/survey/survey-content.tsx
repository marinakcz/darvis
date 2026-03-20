// @ts-nocheck — DEPRECATED: This file is no longer used. All code has been moved to proper App Router routes.
"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useCallback } from "react"
import Image from "next/image"
import type { Job, SurveyMode } from "@/lib/types"
import { Zap, FileText, MapPin, Clock, LogOut, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Navigation2, Phone, X } from "lucide-react"
import { NavigationSheet, useNavigationSheet } from "@/components/navigation-sheet"
import { createEmptyJob } from "@/lib/types"
import { WizardNav } from "@/components/survey/wizard-nav"
import { StepJobInfo } from "@/components/survey/step-job-info"
import { StepInventory } from "@/components/survey/step-inventory"
import { StepQuickRooms } from "@/components/survey/step-quick-rooms"
import { StepMaterials } from "@/components/survey/step-materials"
import { StepCalculation } from "@/components/survey/step-calculation"
import { StepQuote } from "@/components/survey/step-quote"
import { VolumeBar } from "@/components/inventory/volume-bar"
import { PhoneFrame } from "@/components/phone-frame"
import { Button } from "@/components/ui/button"
import { MobileTabBar } from "@/components/mobile-tab-bar"

const STORAGE_KEY = "darvis-job"

function loadJob(): Job {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return createEmptyJob()
}

function saveJob(job: Job) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(job)) } catch { /* ignore */ }
}

/** Splash screen */
function SplashScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
      <div className="flex flex-col items-center gap-3">
        <Image src="/logo.svg" alt="Darvis" width={200} height={54} className="h-14 w-auto" />
        <p className="text-sm text-muted-foreground text-center">
          Váš parťák pro zakázky
        </p>
      </div>
      <Button size="lg" className="h-14 w-full max-w-[240px] text-base" onClick={onContinue}>
        Přihlásit se
      </Button>
      <p className="text-[10px] text-muted-foreground font-mono pt-4">v0.1.0 — demo</p>
    </main>
  )
}

interface MockJob {
  id: string
  name: string
  client: string
  phone: string
  pickup: string
  delivery: string
  distance: number
  date: string
  floor: { pickup: number; delivery: number }
  elevator: { pickup: boolean; delivery: boolean }
  status: "survey" | "approval" | "execution" | "invoicing"
  statusLabel: string
  price: string
  statusColor: string
  highlight?: boolean
  actionable?: boolean
  time?: string
  sentDate?: string
}

/** Today's date for mock data: 2026-03-20 */
const TODAY = "2026-03-20"

const MOCK_JOBS: MockJob[] = [
  {
    id: "dvorak", name: "Dvořák — Karlín \u2192 Mod\u0159any", client: "Petr Dvo\u0159\u00e1k", phone: "+420 777 123 456",
    pickup: "K\u0159i\u017e\u00edkova 42, Praha 8", delivery: "Levsk\u00e9ho 3112, Praha 4",
    distance: 14, date: TODAY, floor: { pickup: 3, delivery: 1 }, elevator: { pickup: false, delivery: true },
    status: "survey", statusLabel: "\u010cek\u00e1 na zam\u011b\u0159en\u00ed", price: "\u2014", statusColor: "text-blue-400",
    highlight: true, actionable: true, time: "09:00",
  },
  {
    id: "kowalski", name: "Kowalski — Sm\u00edchov \u2192 Dejvice", client: "Anna Kowalski", phone: "+420 608 222 333",
    pickup: "Stroupežnického 18, Praha 5", delivery: "Jugoslávských partyzánů 3, Praha 6",
    distance: 8, date: "2026-03-27", floor: { pickup: 2, delivery: 4 }, elevator: { pickup: true, delivery: true },
    status: "survey", statusLabel: "\u010cek\u00e1 na zam\u011b\u0159en\u00ed", price: "\u2014", statusColor: "text-blue-400",
    highlight: true, actionable: true,
  },
  {
    id: "svobodova", name: "Svobodov\u00e1 — Vinohrady \u2192 Letňany", client: "Marie Svobodov\u00e1", phone: "+420 731 444 555",
    pickup: "Korunní 88, Praha 2", delivery: "Tupolevova 710, Praha 9",
    distance: 18, date: "2026-03-18", floor: { pickup: 1, delivery: 0 }, elevator: { pickup: false, delivery: false },
    status: "approval", statusLabel: "\u010cek\u00e1 na schv\u00e1len\u00ed", price: "32 100 K\u010d", statusColor: "text-yellow-400",
    sentDate: "2026-03-17",
  },
  {
    id: "novak", name: "Nov\u00e1k — Žižkov \u2192 Hostiva\u0159", client: "Tom\u00e1\u0161 Nov\u00e1k", phone: "+420 602 888 999",
    pickup: "Husitská 12, Praha 3", delivery: "Hornoměcholupská 55, Praha 10",
    distance: 11, date: TODAY, floor: { pickup: 4, delivery: 2 }, elevator: { pickup: true, delivery: false },
    status: "execution", statusLabel: "Realizace", price: "28 500 K\u010d", statusColor: "text-green-400",
    time: "14:00",
  },
  {
    id: "krejci", name: "Krej\u010d\u00ed — Břevnov \u2192 Barrandov", client: "Lucie Krej\u010d\u00ed", phone: "+420 775 666 777",
    pickup: "B\u011blohorsk\u00e1 90, Praha 6", delivery: "Ke Kaménce 4, Praha 5",
    distance: 9, date: "2026-03-25", floor: { pickup: 2, delivery: 3 }, elevator: { pickup: false, delivery: true },
    status: "execution", statusLabel: "Realizace", price: "19 800 K\u010d", statusColor: "text-green-400",
  },
  {
    id: "horakova", name: "Hor\u00e1kov\u00e1 — Nusle \u2192 Vršovice", client: "Jana Hor\u00e1kov\u00e1", phone: "+420 720 111 222",
    pickup: "Táborská 30, Praha 4", delivery: "Kodaňská 12, Praha 10",
    distance: 5, date: "2026-03-15", floor: { pickup: 0, delivery: 1 }, elevator: { pickup: false, delivery: false },
    status: "invoicing", statusLabel: "K fakturaci", price: "15 200 K\u010d", statusColor: "text-purple-400",
  },
]

const CALENDAR_ENTRIES = [
  { id: "cal1", date: "2026-03-20", client: "Novotná Eva", address: "Vinohradská 18, Praha 2", status: "Zaměření", statusColor: "text-blue-400" },
  { id: "cal2", date: "2026-03-21", client: "Svoboda Tomáš", address: "Na Příkopě 5, Praha 1", status: "Stěhování", statusColor: "text-green-400" },
  { id: "cal3", date: "2026-03-23", client: "Petr Dvořák", address: "Křižíkova 42, Praha 8", status: "Zaměření", statusColor: "text-blue-400" },
  { id: "cal4", date: "2026-03-25", client: "Krejčí Lucie", address: "Bělohorská 90, Praha 6", status: "Nabídka odeslána", statusColor: "text-yellow-400" },
]

/** Calendar mock screen */
function CalendarScreen() {
  return (
    <div className="flex flex-1 flex-col ios-fade-in">
      <header className="bg-background px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Kalendář</h1>
          <span className="text-sm text-muted-foreground">Březen 2026</span>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-3 px-4 py-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider px-1">Nadcházející</p>
        <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
          {CALENDAR_ENTRIES.map((entry) => {
            const dateFormatted = new Date(entry.date).toLocaleDateString("cs-CZ", {
              weekday: "short", day: "numeric", month: "numeric",
            })
            const statusBorderColor = entry.statusColor === "text-blue-400" ? "border-l-blue-400" : entry.statusColor === "text-green-400" ? "border-l-green-400" : "border-l-yellow-400"
            return (
              <div
                key={entry.id}
                className={`p-3 flex flex-col gap-1.5 border-l-[3px] ${statusBorderColor}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="size-3.5 text-muted-foreground" />
                    <span className="font-medium">{dateFormatted}</span>
                  </div>
                  <span className={`text-xs font-medium ${entry.statusColor}`}>{entry.status}</span>
                </div>
                <span className="text-sm font-medium">{entry.client}</span>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  <span>{entry.address}</span>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

/** Profile mock screen */
function ProfileScreen({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="flex flex-1 flex-col ios-fade-in">
      <header className="bg-background px-4 pt-4 pb-2">
        <h1 className="text-2xl font-bold tracking-tight">Profil</h1>
      </header>
      <main className="flex flex-1 flex-col gap-5 px-4 py-4">
        {/* User info */}
        <div className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-1">
          <span className="text-base font-semibold">Jan Technik</span>
          <span className="text-sm text-muted-foreground">Obchodník</span>
        </div>

        {/* Settings */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider px-4 pb-0.5">Nastavení</p>
          <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 min-h-[44px]">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm">Výchozí režim zaměření</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-muted-foreground">Rychlý</span>
                <ChevronRight className="size-4 text-muted-foreground/50" />
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 min-h-[44px]">
              <span className="text-sm">Tmavý režim</span>
              <div className="relative h-[31px] w-[51px] rounded-full bg-primary transition-colors">
                <div className="absolute right-[2px] top-[2px] h-[27px] w-[27px] rounded-full bg-background shadow transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* App info */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider px-4 pb-0.5">Aplikace</p>
          <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 min-h-[44px]">
              <span className="text-sm">Verze</span>
              <span className="text-sm text-muted-foreground">v0.1.0</span>
            </div>
            <button type="button" className="flex items-center justify-between px-4 py-3 min-h-[44px] w-full text-left hover:bg-accent active:bg-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              <span className="text-sm">Podpora</span>
              <ChevronRight className="size-4 text-muted-foreground/50" />
            </button>
            <button type="button" className="flex items-center justify-between px-4 py-3 min-h-[44px] w-full text-left hover:bg-accent active:bg-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              <span className="text-sm">Podmínky použití</span>
              <ChevronRight className="size-4 text-muted-foreground/50" />
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="mt-auto pt-4">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] w-full text-center text-destructive hover:bg-destructive/10 active:bg-destructive/10 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <LogOut className="size-4" />
              <span className="text-sm font-medium">Odhlásit se</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

/** Detail zakázky — Read vs Write layout */
function DetailView({ selectedJob, dateFormatted, onBack, onLoadJob }: {
  selectedJob: MockJob
  dateFormatted: string
  onBack: () => void
  onLoadJob: (mockJob: MockJob, mode: SurveyMode) => void
}) {
  const [crmExpanded, setCrmExpanded] = useState(false)
  const { navAddress, openNav, closeNav } = useNavigationSheet()

  const statusBg = selectedJob.statusColor === "text-blue-400" ? "bg-blue-400/15 text-blue-400" : selectedJob.statusColor === "text-green-400" ? "bg-green-400/15 text-green-400" : selectedJob.statusColor === "text-purple-400" ? "bg-purple-400/15 text-purple-400" : "bg-yellow-400/15 text-yellow-400"

  return (
    <div className="flex flex-1 flex-col ios-slide-in">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl px-4 py-2.5">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onBack} aria-label="Zpět na seznam zakázek" className="flex items-center gap-0.5 text-primary text-sm shrink-0">
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

        {/* CTA buttons — prominent */}
        {selectedJob.actionable && (
          <div className="flex flex-col gap-3 pt-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider px-1">Zahajit zamereni</p>
            <Button size="lg" className="h-14 text-base gap-2 rounded-2xl" onClick={() => onLoadJob(selectedJob, "quick")}>
              <Zap className="size-5" /> Rychle zamereni
            </Button>
            <Button variant="outline" size="lg" className="h-14 text-base gap-2 rounded-2xl" onClick={() => onLoadJob(selectedJob, "detailed")}>
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

/** Single job row used across dashboard sections */
function JobRow({ job, onClick, children }: { job: MockJob; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 min-h-[44px] w-full text-left transition-colors hover:bg-accent active:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div className="flex-1 min-w-0">{children}</div>
      <ChevronRight className="size-4 text-muted-foreground/50 shrink-0" />
    </button>
  )
}

/** Section header — uppercase small grey label */
function SectionHeader({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-muted-foreground uppercase tracking-wider px-1 pt-4 pb-1">{children}</p>
}

/** Grouped card container with divide-y */
function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
      {children}
    </div>
  )
}

/** Dashboard with mock jobs */
function DashboardScreen({ onNewJob, onLoadJob, showModePicker }: { onNewJob: (mode: SurveyMode) => void; onLoadJob: (mockJob: MockJob, mode: SurveyMode) => void; showModePicker?: boolean }) {
  const [view, setView] = useState<"list" | "mode-picker" | "detail">(showModePicker ? "mode-picker" : "list")
  const [selectedJob, setSelectedJob] = useState<MockJob | null>(null)

  const openDetail = useCallback((job: MockJob) => {
    setSelectedJob(job)
    setView("detail")
  }, [])

  if (view === "mode-picker") {
    return (
      <div className="flex flex-1 flex-col ios-slide-in">
        <header className="border-b bg-background/80 backdrop-blur-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setView("list")} aria-label="Zpět na seznam zakázek" className="flex items-center gap-0.5 text-primary text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded">
              <ChevronLeft className="size-5" />
              <span>Zpět</span>
            </button>
            <h1 className="text-lg font-semibold tracking-tight flex-1 text-center pr-12">Nová zakázka</h1>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 px-4 py-6">
          <p className="text-sm text-muted-foreground">Jak chcete zaměřit?</p>
          <button type="button" onClick={() => onNewJob("quick")} className="flex flex-col gap-2 rounded-xl border border-border p-4 text-left transition-colors hover:bg-accent active:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            <div className="flex items-center gap-2">
              <Zap className="size-5" />
              <span className="text-base font-semibold">Rychlý odhad</span>
            </div>
            <p className="text-sm text-muted-foreground">Projdete místnosti a odhadnete % zaplnění auta. Rychlé, bez počítání kusů.</p>
            <span className="text-xs text-muted-foreground font-mono">~2 min · telefon</span>
          </button>
          <button type="button" onClick={() => onNewJob("detailed")} className="flex flex-col gap-2 rounded-xl border border-border p-4 text-left transition-colors hover:bg-accent active:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            <div className="flex items-center gap-2">
              <FileText className="size-5" />
              <span className="text-base font-semibold">Detailní zaměření</span>
            </div>
            <p className="text-sm text-muted-foreground">Soupis každé položky s kusy, službami a materiálem. Přesné, kompletní nabídka.</p>
            <span className="text-xs text-muted-foreground font-mono">~10 min · tablet</span>
          </button>
        </main>
      </div>
    )
  }

  if (view === "detail" && selectedJob) {
    const dateFormatted = new Date(selectedJob.date).toLocaleDateString("cs-CZ", {
      weekday: "short", day: "numeric", month: "long",
    })
    return (
      <DetailView
        selectedJob={selectedJob}
        dateFormatted={dateFormatted}
        onBack={() => setView("list")}
        onLoadJob={onLoadJob}
      />
    )
  }

  // Derive phase groups
  const todayJobs = MOCK_JOBS.filter((j) => j.date === TODAY)
  const surveyJobs = MOCK_JOBS.filter((j) => j.status === "survey")
  const approvalJobs = MOCK_JOBS.filter((j) => j.status === "approval")
  const executionJobs = MOCK_JOBS.filter((j) => j.status === "execution")
  const invoicingJobs = MOCK_JOBS.filter((j) => j.status === "invoicing")

  return (
    <div className="flex flex-1 flex-col ios-fade-in">
      {/* iOS large title header */}
      <header className="bg-background px-4 pt-4 pb-3">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider pb-1">Darvis</p>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight">Dobrý den, Jan</h1>
            <p className="text-sm text-muted-foreground">
              Dnes máte {todayJobs.length} {todayJobs.length === 1 ? "zakázku" : todayJobs.length >= 2 && todayJobs.length <= 4 ? "zakázky" : "zakázek"}
            </p>
          </div>
          <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary text-sm font-semibold shrink-0">
            JT
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-1 px-4 pb-4 overflow-y-auto">
        {/* Quick stats row */}
        <div className="flex items-center gap-2 py-2 overflow-x-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-400/10 text-blue-400 px-3 py-1.5 text-xs font-medium whitespace-nowrap">
            <MapPin className="size-3" />
            K zaměření: {surveyJobs.length}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400/10 text-yellow-400 px-3 py-1.5 text-xs font-medium whitespace-nowrap">
            <Clock className="size-3" />
            Schválení: {approvalJobs.length}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-400/10 text-green-400 px-3 py-1.5 text-xs font-medium whitespace-nowrap">
            <Zap className="size-3" />
            Realizace: {executionJobs.length}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-400/10 text-purple-400 px-3 py-1.5 text-xs font-medium whitespace-nowrap">
            <FileText className="size-3" />
            Fakturace: {invoicingJobs.length}
          </span>
        </div>

        {/* Section: Dnes */}
        <SectionHeader>Dnes</SectionHeader>
        {todayJobs.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">Dnes nemáte žádné zakázky.</p>
          </div>
        ) : (
          <SectionCard>
            {todayJobs.map((job) => {
              const borderColor = job.status === "survey" ? "border-l-blue-400" : job.status === "execution" ? "border-l-green-400" : "border-l-yellow-400"
              return (
                <div key={job.id} className={`border-l-[3px] ${borderColor}`}>
                  <JobRow job={job} onClick={() => openDetail(job)}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium truncate">{job.client}</span>
                      <span className="text-xs font-mono text-muted-foreground shrink-0">{job.time}</span>
                    </div>
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-xs text-muted-foreground truncate">{job.pickup.split(",")[0]}</span>
                      <span className={`text-[11px] font-medium ${job.statusColor}`}>{job.statusLabel}</span>
                    </div>
                  </JobRow>
                </div>
              )
            })}
          </SectionCard>
        )}

        {/* Section: K zaměření */}
        <SectionHeader>K zaměření</SectionHeader>
        <SectionCard>
          {surveyJobs.map((job) => {
            const dateFormatted = new Date(job.date).toLocaleDateString("cs-CZ", { weekday: "short", day: "numeric", month: "numeric" })
            return (
              <div key={job.id} className="border-l-[3px] border-l-blue-400">
                <JobRow job={job} onClick={() => openDetail(job)}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">{job.client}</span>
                    <span className="text-xs font-mono text-muted-foreground shrink-0">{dateFormatted}</span>
                  </div>
                  <span className="text-xs text-muted-foreground truncate block pt-0.5">{job.pickup.split(",")[0]}</span>
                </JobRow>
              </div>
            )
          })}
        </SectionCard>

        {/* Section: Čeká na schválení */}
        {approvalJobs.length > 0 && (
          <>
            <SectionHeader>Čeká na schválení</SectionHeader>
            <SectionCard>
              {approvalJobs.map((job) => {
                const sentFormatted = job.sentDate
                  ? new Date(job.sentDate).toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric" })
                  : ""
                return (
                  <div key={job.id} className="border-l-[3px] border-l-yellow-400">
                    <JobRow job={job} onClick={() => openDetail(job)}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium truncate">{job.client}</span>
                        <span className="text-sm font-mono shrink-0">{job.price}</span>
                      </div>
                      <span className="text-xs text-muted-foreground block pt-0.5">Odesláno {sentFormatted}</span>
                    </JobRow>
                  </div>
                )
              })}
            </SectionCard>
          </>
        )}

        {/* Section: Nadcházející realizace */}
        {executionJobs.length > 0 && (
          <>
            <SectionHeader>Nadcházející realizace</SectionHeader>
            <SectionCard>
              {executionJobs.map((job) => {
                const dateFormatted = new Date(job.date).toLocaleDateString("cs-CZ", { weekday: "short", day: "numeric", month: "numeric" })
                return (
                  <div key={job.id} className="border-l-[3px] border-l-green-400">
                    <JobRow job={job} onClick={() => openDetail(job)}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium truncate">{job.client}</span>
                        <span className="text-xs font-mono text-muted-foreground shrink-0">{dateFormatted}</span>
                      </div>
                      <span className="text-xs text-muted-foreground truncate block pt-0.5">{job.pickup.split(",")[0]}</span>
                    </JobRow>
                  </div>
                )
              })}
            </SectionCard>
          </>
        )}

        {/* New job button */}
        <div className="pt-4">
          <Button size="lg" className="h-14 text-base w-full rounded-2xl" onClick={() => setView("mode-picker")}>
            + Nová zakázka
          </Button>
        </div>
      </main>
    </div>
  )
}

/** Quick mode wizard nav labels */
const QUICK_STEPS = [
  { num: 1, label: "Zakázka" },
  { num: 2, label: "Místnosti" },
  { num: 3, label: "Materiál" },
  { num: 4, label: "Kalkulace" },
  { num: 5, label: "Nabídka" },
]

const DETAILED_STEPS = [
  { num: 1, label: "Zakázka" },
  { num: 2, label: "Inventář" },
  { num: 3, label: "Materiál" },
  { num: 4, label: "Kalkulace" },
  { num: 5, label: "Nabídka" },
]

/** Derive the active tab from the step number */
function getActiveTab(step: number): "jobs" | "new" {
  if (step === -4) return "new"
  return "jobs"
}

/** Whether tab bar should be visible for the given step */
function showTabBar(step: number): boolean {
  // Hidden on splash (0) and wizard steps (>= 1)
  return step < 0
}

export default function SurveyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const step = Number(searchParams.get("step") ?? 0)

  const [job, setJobState] = useState<Job>(loadJob)

  const setJob = useCallback((updater: Job | ((prev: Job) => Job)) => {
    setJobState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater
      saveJob(next)
      return next
    })
  }, [])

  const goTo = useCallback(
    (s: number) => router.push(`/survey?step=${s}`),
    [router],
  )

  const handleNewJob = useCallback((mode: SurveyMode) => {
    const empty = createEmptyJob(mode)
    setJob(empty)
    localStorage.removeItem(STORAGE_KEY)
    goTo(1)
  }, [setJob, goTo])

  const handleNewJobFromQuote = useCallback(() => {
    setJob(createEmptyJob())
    localStorage.removeItem(STORAGE_KEY)
    goTo(0)
  }, [setJob, goTo])

  const handleLoadJob = useCallback((mockJob: MockJob, mode: SurveyMode) => {
    const prefilled = createEmptyJob(mode)
    prefilled.client = { name: mockJob.client, phone: mockJob.phone, email: "" }
    prefilled.pickup = { address: mockJob.pickup, floor: mockJob.floor.pickup, elevator: mockJob.elevator.pickup }
    prefilled.delivery = { address: mockJob.delivery, floor: mockJob.floor.delivery, elevator: mockJob.elevator.delivery }
    prefilled.distance = mockJob.distance
    prefilled.date = mockJob.date
    prefilled.fromCRM = true
    setJob(prefilled)
    // Go to step 1 with readonly CRM data
    goTo(1)
  }, [setJob, goTo])

  const handleTabNavigate = useCallback((tab: "jobs" | "new") => {
    if (tab === "jobs") goTo(-1)
    else if (tab === "new") goTo(-4)
  }, [goTo])

  const handleLogout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    goTo(0)
  }, [goTo])

  let content: React.ReactNode

  if (step === 0) {
    content = <SplashScreen onContinue={() => goTo(-1)} />
  } else if (step === -1) {
    content = <DashboardScreen onNewJob={handleNewJob} onLoadJob={handleLoadJob} />
  } else if (step === -2) {
    content = <CalendarScreen />
  } else if (step === -3) {
    content = <ProfileScreen onLogout={handleLogout} />
  } else if (step === -4) {
    // "Nový" tab — shows the mode picker via Dashboard
    content = <DashboardScreen onNewJob={handleNewJob} onLoadJob={handleLoadJob} showModePicker />
  } else {
    const isQuick = job.mode === "quick"
    const steps = isQuick ? QUICK_STEPS : DETAILED_STEPS

    let stepContent: React.ReactNode = null

    if (isQuick) {
      // Quick mode: 1=job, 2=rooms%, 3=materials, 4=calc, 5=quote
      if (step === 1) stepContent = <StepJobInfo job={job} onChange={setJob} onNext={() => goTo(2)} readonly={job.fromCRM} />
      if (step === 2) stepContent = <StepQuickRooms job={job} onChange={setJob} onNext={() => goTo(3)} onBack={() => goTo(1)} />
      if (step === 3) stepContent = <StepMaterials job={job} onChange={setJob} onNext={() => goTo(4)} onBack={() => goTo(2)} />
      if (step === 4) stepContent = <StepCalculation job={job} onChange={setJob} onNext={() => goTo(5)} onBack={() => goTo(3)} />
      if (step === 5) stepContent = <StepQuote job={job} onBack={() => goTo(4)} onNewJob={handleNewJobFromQuote} onGoToCalc={() => goTo(4)} />
    } else {
      // Detailed mode: 1=job, 2=inventory, 3=materials, 4=calc, 5=quote
      if (step === 1) stepContent = <StepJobInfo job={job} onChange={setJob} onNext={() => goTo(2)} readonly={job.fromCRM} />
      if (step === 2) stepContent = <StepInventory job={job} onChange={setJob} onNext={() => goTo(3)} onBack={() => goTo(1)} />
      if (step === 3) stepContent = <StepMaterials job={job} onChange={setJob} onNext={() => goTo(4)} onBack={() => goTo(2)} />
      if (step === 4) stepContent = <StepCalculation job={job} onChange={setJob} onNext={() => goTo(5)} onBack={() => goTo(3)} />
      if (step === 5) stepContent = <StepQuote job={job} onBack={() => goTo(4)} onNewJob={handleNewJobFromQuote} onGoToCalc={() => goTo(4)} />
    }

    content = (
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-2xl flex-col gap-2 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goTo(-1)}
                  aria-label="Zavrit pruvodce"
                  className="flex items-center justify-center size-11 -ml-2 rounded-lg text-muted-foreground hover:bg-accent active:bg-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <X className="size-5" />
                </button>
                <h1 className="text-lg font-semibold tracking-tight">Darvis</h1>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono px-1.5 py-0.5 rounded bg-muted">
                  {isQuick ? <><Zap className="size-3" /> rychlý</> : <><FileText className="size-3" /> detailní</>}
                </span>
              </div>
              <VolumeBar job={job} />
            </div>
            <WizardNav currentStep={step} onStepClick={goTo} steps={steps} />
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6 ios-slide-in" key={step}>
          {stepContent}
        </main>
      </div>
    )
  }

  const tabBar = showTabBar(step) ? (
    <MobileTabBar activeTab={getActiveTab(step)} onNavigate={handleTabNavigate} />
  ) : null

  return <PhoneFrame tabBar={tabBar}>{content}</PhoneFrame>
}

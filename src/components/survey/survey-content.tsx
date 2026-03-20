"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useCallback } from "react"
import Image from "next/image"
import type { Job, SurveyMode } from "@/lib/types"
import { Zap, FileText, MapPin, Clock, LogOut, ChevronRight } from "lucide-react"
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
  status: string
  price: string
  statusColor: string
  highlight?: boolean
  actionable?: boolean
}

const MOCK_JOBS: MockJob[] = [
  {
    id: "dvorak", name: "Dvořák — Karlín → Modřany", client: "Petr Dvořák", phone: "+420 777 123 456",
    pickup: "Křižíkova 42, Praha 8", delivery: "Levského 3112, Praha 4",
    distance: 14, date: "2026-03-25", floor: { pickup: 3, delivery: 1 }, elevator: { pickup: false, delivery: true },
    status: "Čeká na zaměření", price: "—", statusColor: "text-blue-400", highlight: true, actionable: true,
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
    <div className="flex flex-1 flex-col">
      <header className="border-b bg-background px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">Kalendář</h1>
          <span className="text-sm text-muted-foreground">Březen 2026</span>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-3 px-4 py-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Nadcházející</p>
        {CALENDAR_ENTRIES.map((entry) => {
          const dateFormatted = new Date(entry.date).toLocaleDateString("cs-CZ", {
            weekday: "short", day: "numeric", month: "numeric",
          })
          return (
            <div
              key={entry.id}
              className="rounded-lg border border-border p-3 flex flex-col gap-1.5"
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
      </main>
    </div>
  )
}

/** Profile mock screen */
function ProfileScreen({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b bg-background px-4 py-3">
        <h1 className="text-lg font-semibold tracking-tight">Profil</h1>
      </header>
      <main className="flex flex-1 flex-col gap-4 px-4 py-4">
        {/* User info */}
        <div className="rounded-lg border border-border p-4 flex flex-col gap-1">
          <span className="text-base font-semibold">Jan Technik</span>
          <span className="text-sm text-muted-foreground">Obchodník</span>
        </div>

        {/* Settings */}
        <div className="flex flex-col gap-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider px-1 pb-1">Nastavení</p>
          <div className="rounded-lg border border-border divide-y divide-border">
            <div className="flex items-center justify-between p-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">Výchozí režim zaměření</span>
                <span className="text-xs text-muted-foreground">Rychlý / Detailní</span>
              </div>
              <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">Rychlý</span>
            </div>
            <div className="flex items-center justify-between p-3">
              <span className="text-sm font-medium">Tmavý režim</span>
              <div className="relative h-6 w-10 rounded-full bg-primary transition-colors">
                <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-background shadow transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* App info */}
        <div className="flex flex-col gap-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider px-1 pb-1">Aplikace</p>
          <div className="rounded-lg border border-border divide-y divide-border">
            <div className="flex items-center justify-between p-3">
              <span className="text-sm text-muted-foreground">Verze</span>
              <span className="text-xs font-mono text-muted-foreground">v0.1.0</span>
            </div>
            <button type="button" className="flex items-center justify-between p-3 w-full text-left hover:bg-accent transition-colors rounded-b-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              <span className="text-sm text-muted-foreground">Podpora</span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="mt-auto pt-4">
          <Button variant="outline" size="lg" className="h-12 w-full text-base gap-2 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={onLogout}>
            <LogOut className="size-4" />
            Odhlásit se
          </Button>
        </div>
      </main>
    </div>
  )
}

/** Dashboard with mock jobs */
function DashboardScreen({ onNewJob, onLoadJob, showModePicker }: { onNewJob: (mode: SurveyMode) => void; onLoadJob: (mockJob: MockJob, mode: SurveyMode) => void; showModePicker?: boolean }) {
  const [view, setView] = useState<"list" | "mode-picker" | "detail">(showModePicker ? "mode-picker" : "list")
  const [selectedJob, setSelectedJob] = useState<MockJob | null>(null)

  if (view === "mode-picker") {
    return (
      <div className="flex flex-1 flex-col">
        <header className="border-b bg-background px-4 py-3">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setView("list")} aria-label="Zpět na seznam zakázek" className="text-muted-foreground text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded">←</button>
            <h1 className="text-lg font-semibold tracking-tight">Nová zakázka</h1>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 px-4 py-6">
          <p className="text-sm text-muted-foreground">Jak chcete zaměřit?</p>
          <button type="button" onClick={() => onNewJob("quick")} className="flex flex-col gap-2 rounded-xl border border-border p-4 text-left transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            <div className="flex items-center gap-2">
              <Zap className="size-5" />
              <span className="text-base font-semibold">Rychlý odhad</span>
            </div>
            <p className="text-sm text-muted-foreground">Projdete místnosti a odhadnete % zaplnění auta. Rychlé, bez počítání kusů.</p>
            <span className="text-xs text-muted-foreground font-mono">~2 min · telefon</span>
          </button>
          <button type="button" onClick={() => onNewJob("detailed")} className="flex flex-col gap-2 rounded-xl border border-border p-4 text-left transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
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
      <div className="flex flex-1 flex-col">
        <header className="border-b bg-background px-4 py-3">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setView("list")} aria-label="Zpět na seznam zakázek" className="text-muted-foreground text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded">←</button>
            <h1 className="text-lg font-semibold tracking-tight">Detail zakázky</h1>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 px-4 py-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${selectedJob.statusColor}`}>{selectedJob.status}</span>
            <span className="text-xs text-muted-foreground">{dateFormatted}</span>
          </div>

          {/* Client */}
          <div className="rounded-lg border border-border p-3 flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Klient</span>
            <span className="text-sm font-medium">{selectedJob.client}</span>
            <span className="text-sm text-muted-foreground">{selectedJob.phone}</span>
          </div>

          {/* Pickup */}
          <div className="rounded-lg border border-border p-3 flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Nakládka</span>
            <span className="text-sm">{selectedJob.pickup}</span>
            <span className="text-xs text-muted-foreground">
              {selectedJob.floor.pickup}. patro{selectedJob.elevator.pickup ? " · výtah" : " · bez výtahu"}
            </span>
          </div>

          {/* Delivery */}
          <div className="rounded-lg border border-border p-3 flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Vykládka</span>
            <span className="text-sm">{selectedJob.delivery}</span>
            <span className="text-xs text-muted-foreground">
              {selectedJob.floor.delivery}. patro{selectedJob.elevator.delivery ? " · výtah" : " · bez výtahu"}
            </span>
          </div>

          {/* Distance */}
          <div className="flex justify-between text-sm px-1">
            <span className="text-muted-foreground">Vzdálenost</span>
            <span className="font-mono">{selectedJob.distance} km</span>
          </div>

          {/* Price if exists */}
          {selectedJob.price !== "—" && (
            <div className="flex justify-between text-sm px-1">
              <span className="text-muted-foreground">Cena</span>
              <span className="font-mono font-medium">{selectedJob.price}</span>
            </div>
          )}

          {/* Action buttons */}
          {selectedJob.actionable && (
            <div className="flex flex-col gap-2 pt-2">
              <Button size="lg" className="h-14 text-base gap-2" onClick={() => onLoadJob(selectedJob, "quick")}>
                <Zap className="size-4" /> Rychlé zaměření
              </Button>
              <Button variant="outline" size="lg" className="h-14 text-base gap-2" onClick={() => onLoadJob(selectedJob, "detailed")}>
                <FileText className="size-4" /> Detailní zaměření
              </Button>
            </div>
          )}
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b bg-background px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">Zakázky</h1>
          <span className="text-xs text-muted-foreground font-mono">Jan T.</span>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-3 px-4 py-4">
        {MOCK_JOBS.map((job) => (
          <button
            key={job.id}
            type="button"
            onClick={() => { setSelectedJob(job); setView("detail") }}
            className={`rounded-lg border p-3 text-left transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${job.highlight ? "border-blue-500/30 bg-blue-500/5" : "border-border"}`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium">{job.name}</span>
              <span className="font-mono text-xs text-muted-foreground">{new Date(job.date).toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric" })}</span>
            </div>
            <div className="flex items-center justify-between pt-1.5">
              <span className={`text-xs font-medium ${job.statusColor}`}>{job.status}</span>
              <span className="font-mono text-sm">{job.price}</span>
            </div>
          </button>
        ))}
        <Button size="lg" className="h-14 text-base mt-2" onClick={() => setView("mode-picker")}>
          + Nová zakázka
        </Button>
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
function getActiveTab(step: number): "jobs" | "calendar" | "new" | "profile" {
  if (step === -2) return "calendar"
  if (step === -3) return "profile"
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
    setJob(prefilled)
    // Skip step 1 (job info already filled) → go to step 2
    goTo(2)
  }, [setJob, goTo])

  const handleTabNavigate = useCallback((tab: "jobs" | "calendar" | "new" | "profile") => {
    if (tab === "jobs") goTo(-1)
    else if (tab === "calendar") goTo(-2)
    else if (tab === "new") goTo(-4)
    else if (tab === "profile") goTo(-3)
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
      if (step === 1) stepContent = <StepJobInfo job={job} onChange={setJob} onNext={() => goTo(2)} />
      if (step === 2) stepContent = <StepQuickRooms job={job} onChange={setJob} onNext={() => goTo(3)} onBack={() => goTo(1)} />
      if (step === 3) stepContent = <StepMaterials job={job} onChange={setJob} onNext={() => goTo(4)} onBack={() => goTo(2)} />
      if (step === 4) stepContent = <StepCalculation job={job} onChange={setJob} onNext={() => goTo(5)} onBack={() => goTo(3)} />
      if (step === 5) stepContent = <StepQuote job={job} onBack={() => goTo(4)} onNewJob={handleNewJobFromQuote} />
    } else {
      // Detailed mode: 1=job, 2=inventory, 3=materials, 4=calc, 5=quote
      if (step === 1) stepContent = <StepJobInfo job={job} onChange={setJob} onNext={() => goTo(2)} />
      if (step === 2) stepContent = <StepInventory job={job} onChange={setJob} onNext={() => goTo(3)} onBack={() => goTo(1)} />
      if (step === 3) stepContent = <StepMaterials job={job} onChange={setJob} onNext={() => goTo(4)} onBack={() => goTo(2)} />
      if (step === 4) stepContent = <StepCalculation job={job} onChange={setJob} onNext={() => goTo(5)} onBack={() => goTo(3)} />
      if (step === 5) stepContent = <StepQuote job={job} onBack={() => goTo(4)} onNewJob={handleNewJobFromQuote} />
    }

    content = (
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="mx-auto flex max-w-2xl flex-col gap-2 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
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
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6">
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

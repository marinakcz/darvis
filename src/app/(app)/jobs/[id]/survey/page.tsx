"use client"

import { use, useState, useCallback, useSyncExternalStore } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Zap, FileText, X } from "lucide-react"
import type { Job, SurveyMode } from "@/lib/types"
import { createEmptyJob } from "@/lib/types"
import { getMockJobById } from "@/lib/mock-data"
import { WizardNav } from "@/components/survey/wizard-nav"
import { StepJobInfo } from "@/components/survey/step-job-info"
import { StepInventory } from "@/components/survey/step-inventory"
import { StepQuickRooms } from "@/components/survey/step-quick-rooms"
import { StepMaterials } from "@/components/survey/step-materials"
import { StepCalculation } from "@/components/survey/step-calculation"
import { StepQuote } from "@/components/survey/step-quote"
import { VolumeBar } from "@/components/inventory/volume-bar"

function storageKey(jobId: string) {
  return `darvis-job-${jobId}`
}

function loadJob(jobId: string, mode: SurveyMode): Job {
  try {
    const saved = localStorage.getItem(storageKey(jobId))
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }

  // Pre-fill from mock data if available
  const mock = getMockJobById(jobId)
  if (mock) {
    const prefilled = createEmptyJob(mode)
    prefilled.client = { name: mock.client, phone: mock.phone, email: "" }
    prefilled.pickup = { address: mock.pickup, floor: mock.floor.pickup, elevator: mock.elevator.pickup }
    prefilled.delivery = { address: mock.delivery, floor: mock.floor.delivery, elevator: mock.elevator.delivery }
    prefilled.distance = mock.distance
    prefilled.date = mock.date
    prefilled.fromCRM = true
    return prefilled
  }

  return createEmptyJob(mode)
}

function saveJobToStorage(jobId: string, job: Job) {
  try { localStorage.setItem(storageKey(jobId), JSON.stringify(job)) } catch { /* ignore */ }
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

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

export default function SurveyWizardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  const mounted = useIsMounted()

  const mode = (searchParams.get("mode") as SurveyMode) || "detailed"

  const [step, setStep] = useState(1)
  const [job, setJobState] = useState<Job>(() => loadJob(jobId, mode))

  const setJob = useCallback((updater: Job | ((prev: Job) => Job)) => {
    setJobState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater
      saveJobToStorage(jobId, next)
      return next
    })
  }, [jobId])

  const handleNewJobFromQuote = useCallback(() => {
    localStorage.removeItem(storageKey(jobId))
    router.push("/dashboard")
  }, [jobId, router])

  if (!mounted) return null

  const isQuick = job.mode === "quick"
  const steps = isQuick ? QUICK_STEPS : DETAILED_STEPS

  let stepContent: React.ReactNode = null

  if (isQuick) {
    if (step === 1) stepContent = <StepJobInfo job={job} onChange={setJob} onNext={() => setStep(2)} readonly={job.fromCRM} />
    if (step === 2) stepContent = <StepQuickRooms job={job} onChange={setJob} onNext={() => setStep(3)} onBack={() => setStep(1)} />
    if (step === 3) stepContent = <StepMaterials job={job} onChange={setJob} onNext={() => setStep(4)} onBack={() => setStep(2)} />
    if (step === 4) stepContent = <StepCalculation job={job} onChange={setJob} onNext={() => setStep(5)} onBack={() => setStep(3)} />
    if (step === 5) stepContent = <StepQuote job={job} onBack={() => setStep(4)} onNewJob={handleNewJobFromQuote} onGoToCalc={() => setStep(4)} />
  } else {
    if (step === 1) stepContent = <StepJobInfo job={job} onChange={setJob} onNext={() => setStep(2)} readonly={job.fromCRM} />
    if (step === 2) stepContent = <StepInventory job={job} onChange={setJob} onNext={() => setStep(3)} onBack={() => setStep(1)} />
    if (step === 3) stepContent = <StepMaterials job={job} onChange={setJob} onNext={() => setStep(4)} onBack={() => setStep(2)} />
    if (step === 4) stepContent = <StepCalculation job={job} onChange={setJob} onNext={() => setStep(5)} onBack={() => setStep(3)} />
    if (step === 5) stepContent = <StepQuote job={job} onBack={() => setStep(4)} onNewJob={handleNewJobFromQuote} onGoToCalc={() => setStep(4)} />
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl flex-col gap-2 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
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
          <WizardNav currentStep={step} onStepClick={setStep} steps={steps} />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6 ios-slide-in" key={step}>
        {stepContent}
      </main>
    </div>
  )
}

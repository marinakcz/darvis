// SwiftUI: Custom ProgressIndicator
interface Step {
  num: number
  label: string
}

interface WizardNavProps {
  currentStep: number
  onStepClick: (step: number) => void
  steps?: Step[]
}

const DEFAULT_STEPS: Step[] = [
  { num: 1, label: "Zakázka" },
  { num: 2, label: "Inventář" },
  { num: 3, label: "Kalkulace" },
  { num: 4, label: "Nabídka" },
]

export function WizardNav({ currentStep, onStepClick, steps = DEFAULT_STEPS }: WizardNavProps) {
  return (
    <nav aria-label="Průvodce zakázkou" className="flex gap-2">
      {steps.map(({ num, label }) => {
        const isActive = num === currentStep
        const isDone = num < currentStep
        return (
          <button
            key={num}
            type="button"
            onClick={() => onStepClick(num)}
            aria-current={isActive ? "step" : undefined}
            aria-label={`Krok ${num}: ${label}`}
            className={`flex flex-1 flex-col items-center gap-1 rounded-lg px-1.5 py-2.5 min-h-[44px] text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              isActive
                ? "bg-primary text-primary-foreground"
                : isDone
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground"
            }`}
          >
            <span className="font-mono text-xs">{num}</span>
            <span className="text-xs">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}

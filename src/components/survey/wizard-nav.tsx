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
    <nav className="flex gap-1">
      {steps.map(({ num, label }) => {
        const isActive = num === currentStep
        const isDone = num < currentStep
        return (
          <button
            key={num}
            type="button"
            onClick={() => onStepClick(num)}
            className={`flex flex-1 flex-col items-center gap-1 rounded-md px-1.5 py-1.5 text-xs font-medium transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : isDone
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground"
            }`}
          >
            <span className="font-mono text-[10px]">{num}</span>
            <span className="text-[10px]">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}

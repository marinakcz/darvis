"use client"

import { useState } from "react"
import type { Job, MaterialOrder } from "@/lib/types"
import { MATERIAL_LABELS, MATERIAL_UNITS } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Box, Container, RotateCw, Wind, FileText, ChevronDown, ChevronUp } from "lucide-react"
import type { ComponentType } from "react"
import type { LucideProps } from "lucide-react"

interface StepMaterialsProps {
  job: Job
  onChange: (updater: (prev: Job) => Job) => void
  onNext: () => void
  onBack: () => void
}

const MATERIAL_ICON_MAP: Record<keyof MaterialOrder, ComponentType<LucideProps>> = {
  boxes: Box,
  crates: Container,
  stretchWrap: RotateCw,
  bubbleWrap: Wind,
  packingPaper: FileText,
}

const MATERIAL_KEYS: (keyof MaterialOrder)[] = [
  "boxes",
  "crates",
  "stretchWrap",
  "bubbleWrap",
  "packingPaper",
]

export function StepMaterials({ job, onChange, onNext, onBack }: StepMaterialsProps) {
  const [showZeroItems, setShowZeroItems] = useState(false)

  function updateMaterial(key: keyof MaterialOrder, delta: number) {
    onChange((prev) => ({
      ...prev,
      materials: {
        ...prev.materials,
        [key]: Math.max(0, prev.materials[key] + delta),
      },
    }))
  }

  const nonZeroKeys = MATERIAL_KEYS.filter((key) => job.materials[key] > 0)
  const zeroKeys = MATERIAL_KEYS.filter((key) => job.materials[key] === 0)

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground px-1">
        Obalove materialy — ponechte na 0 pro automaticky odhad.
      </p>

      {/* Non-zero materials — always visible, prominent */}
      {nonZeroKeys.map((key) => (
        <MaterialRow
          key={key}
          materialKey={key}
          value={job.materials[key]}
          onUpdate={updateMaterial}
        />
      ))}

      {/* Zero-quantity materials — compact collapsible section */}
      {zeroKeys.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setShowZeroItems((prev) => !prev)}
            className="flex items-center justify-between rounded-2xl border border-dashed border-border bg-card px-4 py-3 min-h-[44px] w-full text-left transition-colors hover:bg-accent active:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span className="text-sm text-muted-foreground">
              {showZeroItems ? "Skryt materialy" : `Pridat material (${zeroKeys.length})`}
            </span>
            {showZeroItems ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
          </button>

          {showZeroItems && zeroKeys.map((key) => (
            <MaterialRow
              key={key}
              materialKey={key}
              value={job.materials[key]}
              onUpdate={updateMaterial}
            />
          ))}
        </>
      )}

      <div className="sticky bottom-0 bg-background/95 backdrop-blur py-4 -mx-4 px-4 border-t border-border mt-auto">
        <div className="flex gap-3">
          <Button variant="outline" size="lg" className="h-14 flex-1" onClick={onBack}>
            &larr; Zpet
          </Button>
          <Button size="lg" className="h-14 flex-1 text-base" onClick={onNext}>
            Spocitat kalkulaci &rarr;
          </Button>
        </div>
      </div>
    </div>
  )
}

function MaterialRow({ materialKey, value, onUpdate }: {
  materialKey: keyof MaterialOrder
  value: number
  onUpdate: (key: keyof MaterialOrder, delta: number) => void
}) {
  const Icon = MATERIAL_ICON_MAP[materialKey]
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-2.5">
      <div className="flex items-center gap-2.5">
        <Icon className="size-4 text-muted-foreground" />
        <div className="flex flex-col">
          <span className="text-sm font-medium">{MATERIAL_LABELS[materialKey]}</span>
          <span className="text-[10px] text-muted-foreground">{MATERIAL_UNITS[materialKey]}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-11 w-11 p-0 text-lg"
          onClick={() => onUpdate(materialKey, -1)}
          aria-label={`Ubrat ${MATERIAL_LABELS[materialKey]}`}
        >
          -
        </Button>
        <span className="w-10 text-center font-mono text-sm font-medium" aria-live="polite" aria-label={`${MATERIAL_LABELS[materialKey]}: ${value} ${MATERIAL_UNITS[materialKey]}`}>
          {value}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-11 w-11 p-0 text-lg"
          onClick={() => onUpdate(materialKey, 1)}
          aria-label={`Pridat ${MATERIAL_LABELS[materialKey]}`}
        >
          +
        </Button>
      </div>
    </div>
  )
}

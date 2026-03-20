"use client"

import type { Job, MaterialOrder } from "@/lib/types"
import { MATERIAL_LABELS, MATERIAL_UNITS } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Box, Container, RotateCw, Wind, FileText, Minus, Plus } from "lucide-react"
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
  function updateMaterial(key: keyof MaterialOrder, delta: number) {
    onChange((prev) => ({
      ...prev,
      materials: {
        ...prev.materials,
        [key]: Math.max(0, prev.materials[key] + delta),
      },
    }))
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Obalové materiály</CardTitle>
          <p className="text-sm text-muted-foreground">
            Kolik materiálu bude potřeba?
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {MATERIAL_KEYS.map((key) => {
            const Icon = MATERIAL_ICON_MAP[key]
            return (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg border border-border p-3"
            >
              <div className="flex items-center gap-2.5">
                <Icon className="size-5 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{MATERIAL_LABELS[key]}</span>
                  <span className="text-xs text-muted-foreground">{MATERIAL_UNITS[key]}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0 text-lg"
                  onClick={() => updateMaterial(key, -1)}
                >
                  −
                </Button>
                <span className="w-10 text-center font-mono text-sm font-medium">
                  {job.materials[key]}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0 text-lg"
                  onClick={() => updateMaterial(key, 1)}
                >
                  +
                </Button>
              </div>
            </div>
            )
          })}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Nechte na 0 pro automatický odhad.
      </p>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" size="lg" className="h-14 flex-1" onClick={onBack}>
          ← Zpět
        </Button>
        <Button size="lg" className="h-14 flex-1 text-base" onClick={onNext}>
          Kalkulace →
        </Button>
      </div>
    </div>
  )
}

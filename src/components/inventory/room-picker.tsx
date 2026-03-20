"use client"

import type { RoomType } from "@/lib/types"
import { ROOM_LABELS } from "@/lib/types"
import { RoomIcon } from "@/components/icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

const ROOM_TYPES: RoomType[] = [
  "bedroom",
  "living",
  "kitchen",
  "bathroom",
  "kids",
  "office",
  "hallway",
  "basement",
  "other",
]

interface RoomPickerProps {
  onSelect: (type: RoomType) => void
  onClose: () => void
}

export function RoomPicker({ onSelect, onClose }: RoomPickerProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Vyberte místnost</CardTitle>
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {ROOM_TYPES.map((type) => {
            const Icon = RoomIcon[type]
            return (
              <button
                key={type}
                type="button"
                onClick={() => onSelect(type)}
                className="flex flex-col items-center gap-1.5 rounded-lg border border-border p-3 text-sm transition-colors hover:bg-accent active:bg-accent"
              >
                <Icon className="size-6 text-muted-foreground" />
                <span className="text-xs font-medium">{ROOM_LABELS[type]}</span>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

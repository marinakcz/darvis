// SwiftUI: Grid Picker in .sheet
"use client"

import type { RoomType } from "@/lib/types"
import { ROOM_LABELS } from "@/lib/types"
import { RoomIcon } from "@/components/icons"
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
    <div className="fixed inset-0 z-50 flex flex-col justify-end ios-sheet-backdrop">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 ios-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Sheet content */}
      <div className="relative rounded-t-2xl bg-background border-t border-border pb-[env(safe-area-inset-bottom)] ios-sheet-content">
        {/* Drag indicator */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="h-[5px] w-[36px] rounded-full bg-muted-foreground/30" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 pt-1">
          <h2 className="text-base font-semibold">Vyberte místnost</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zavřít výběr místnosti"
            className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <X className="size-4" />
          </button>
        </div>
        {/* Grid */}
        <div className="grid grid-cols-3 gap-2 px-4 pb-6">
          {ROOM_TYPES.map((type) => {
            const Icon = RoomIcon[type]
            return (
              <button
                key={type}
                type="button"
                onClick={() => onSelect(type)}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-border p-3 text-sm min-h-[44px] transition-colors hover:bg-accent active:bg-accent"
              >
                <Icon className="size-6 text-muted-foreground" />
                <span className="text-xs font-medium">{ROOM_LABELS[type]}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

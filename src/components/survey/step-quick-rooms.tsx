"use client"

import { useState } from "react"
import type { Job, RoomType, QuickRoom } from "@/lib/types"
import { ROOM_LABELS } from "@/lib/types"
import { RoomIcon } from "@/components/icons"
import { TRUCK_CAPACITY } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RoomPicker } from "@/components/inventory/room-picker"

interface StepQuickRoomsProps {
  job: Job
  onChange: (updater: (prev: Job) => Job) => void
  onNext: () => void
  onBack: () => void
}

const PERCENT_STEPS = [5, 10, 15, 20, 25, 30, 40, 50]

export function StepQuickRooms({ job, onChange, onNext, onBack }: StepQuickRoomsProps) {
  const [showPicker, setShowPicker] = useState(false)

  const totalPercent = job.quickRooms.reduce((sum, r) => sum + r.percent, 0)
  const totalVolume = (totalPercent / 100) * TRUCK_CAPACITY
  const truckCount = Math.max(1, Math.ceil(totalPercent / 100))

  function addRoom(type: RoomType) {
    const newRoom: QuickRoom = {
      id: `qr-${Date.now()}`,
      type,
      percent: 10,
    }
    onChange((prev) => ({ ...prev, quickRooms: [...prev.quickRooms, newRoom] }))
    setShowPicker(false)
  }

  function updatePercent(roomId: string, percent: number) {
    onChange((prev) => ({
      ...prev,
      quickRooms: prev.quickRooms.map((r) =>
        r.id === roomId ? { ...r, percent } : r,
      ),
    }))
  }

  function removeRoom(roomId: string) {
    onChange((prev) => ({
      ...prev,
      quickRooms: prev.quickRooms.filter((r) => r.id !== roomId),
    }))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Total bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Zaplnění</span>
            <span className="font-mono text-sm font-medium">
              {totalPercent}% → {totalVolume.toFixed(1)} m³ → {truckCount} auto{truckCount > 1 ? "a" : ""}
            </span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={totalPercent} aria-valuemin={0} aria-valuemax={100} aria-label="Zaplnění auta">
            <div
              className={`h-full rounded-full transition-all ${totalPercent > 100 ? "bg-amber-500" : "bg-emerald-500"}`}
              style={{ width: `${Math.min(totalPercent, 100)}%` }}
            />
          </div>
          {totalPercent > 100 && (
            <p role="alert" className="text-xs text-amber-400 mt-1">
              Objem přesahuje jedno auto — budou potřeba {truckCount} auta.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Empty state */}
      {job.quickRooms.length === 0 && !showPicker && (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-lg text-muted-foreground">
            Zatím nemáte žádné místnosti.
          </p>
          <p className="text-sm text-muted-foreground">
            Přidejte místnosti a odhadněte, kolik procent auta každá zabere.
          </p>
          <Button size="lg" className="h-14 text-base" onClick={() => setShowPicker(true)}>
            + Přidat místnost
          </Button>
        </div>
      )}

      {/* Rooms */}
      {job.quickRooms.map((room) => (
        <Card key={room.id}>
          <CardContent className="py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {(() => { const Icon = RoomIcon[room.type]; return <Icon className="size-5 text-muted-foreground" /> })()}
                <span className="text-sm font-medium">{ROOM_LABELS[room.type]}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono">
                  {room.percent}%
                </Badge>
                <button
                  type="button"
                  onClick={() => removeRoom(room.id)}
                  aria-label={`Odebrat ${ROOM_LABELS[room.type]}`}
                  className="flex items-center justify-center h-11 w-11 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
            {/* Percent chips */}
            <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Zaplnění pro ${ROOM_LABELS[room.type]}`}>
              {PERCENT_STEPS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => updatePercent(room.id, p)}
                  aria-pressed={room.percent === p}
                  className={`h-11 rounded-lg px-3 py-2 text-sm font-mono font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    room.percent === p
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {p}%
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add room */}
      {showPicker ? (
        <RoomPicker onSelect={addRoom} onClose={() => setShowPicker(false)} />
      ) : (
        <Button
          variant="outline"
          size="lg"
          className="h-12 border-dashed"
          onClick={() => setShowPicker(true)}
        >
          + Přidat místnost
        </Button>
      )}

      {/* Nav */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur py-4 -mx-4 px-4 border-t border-border mt-auto">
        <div className="flex gap-3">
          <Button variant="outline" size="lg" className="h-14 flex-1" onClick={onBack}>
            ← Zpět
          </Button>
          <Button
            size="lg"
            className="h-14 flex-1 text-base"
            onClick={onNext}
            disabled={job.quickRooms.length === 0}
          >
            Pokračovat na materiál →
          </Button>
        </div>
      </div>
    </div>
  )
}

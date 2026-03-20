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
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${totalPercent > 100 ? "bg-amber-500" : "bg-emerald-500"}`}
              style={{ width: `${Math.min(totalPercent, 100)}%` }}
            />
          </div>
          {totalPercent > 100 && (
            <p className="text-xs text-amber-400 mt-1">
              Přesah → {truckCount} auta potřeba
            </p>
          )}
        </CardContent>
      </Card>

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
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
            {/* Percent chips */}
            <div className="flex flex-wrap gap-1.5">
              {PERCENT_STEPS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => updatePercent(room.id, p)}
                  className={`rounded-lg px-3 py-2 text-sm font-mono font-medium transition-colors ${
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
      <div className="flex gap-3 pt-4">
        <Button variant="outline" size="lg" className="h-14 flex-1" onClick={onBack}>
          ← Zpět
        </Button>
        <Button
          size="lg"
          className="h-14 flex-1 text-base"
          onClick={onNext}
          disabled={job.quickRooms.length === 0}
        >
          Materiál →
        </Button>
      </div>
    </div>
  )
}

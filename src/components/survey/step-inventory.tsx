"use client"

import { useState } from "react"
import type { Job, Room, RoomType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { RoomPicker } from "@/components/inventory/room-picker"
import { RoomPanel } from "@/components/inventory/room-panel"

interface StepInventoryProps {
  job: Job
  onChange: (updater: (prev: Job) => Job) => void
  onNext: () => void
  onBack: () => void
}

export function StepInventory({ job, onChange, onNext, onBack }: StepInventoryProps) {
  const [showPicker, setShowPicker] = useState(false)

  function addRoom(type: RoomType) {
    const count = job.rooms.filter((r) => r.type === type).length
    const newRoom: Room = {
      id: `${type}-${Date.now()}`,
      type,
      customName: count > 0 ? `${type}-${count + 1}` : undefined,
      items: [],
    }
    onChange((prev) => ({ ...prev, rooms: [...prev.rooms, newRoom] }))
    setShowPicker(false)
  }

  function updateRoom(roomId: string, updater: (room: Room) => Room) {
    onChange((prev) => ({
      ...prev,
      rooms: prev.rooms.map((r) => (r.id === roomId ? updater(r) : r)),
    }))
  }

  function removeRoom(roomId: string) {
    onChange((prev) => ({
      ...prev,
      rooms: prev.rooms.filter((r) => r.id !== roomId),
    }))
  }

  return (
    <div className="flex flex-col gap-4">
      {job.rooms.length === 0 && !showPicker && (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-lg text-muted-foreground">
            Zatím žádné místnosti
          </p>
          <Button size="lg" className="h-14 text-base" onClick={() => setShowPicker(true)}>
            + Přidat místnost
          </Button>
        </div>
      )}

      {/* Existing rooms */}
      {job.rooms.map((room) => (
        <RoomPanel
          key={room.id}
          room={room}
          onUpdate={(updater) => updateRoom(room.id, updater)}
          onRemove={() => removeRoom(room.id)}
        />
      ))}

      {/* Room picker */}
      {showPicker && (
        <RoomPicker
          onSelect={addRoom}
          onClose={() => setShowPicker(false)}
        />
      )}

      {/* Add more rooms */}
      {job.rooms.length > 0 && !showPicker && (
        <Button
          variant="outline"
          size="lg"
          className="h-12 border-dashed"
          onClick={() => setShowPicker(true)}
        >
          + Přidat místnost
        </Button>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" size="lg" className="h-14 flex-1" onClick={onBack}>
          ← Zpět
        </Button>
        <Button
          size="lg"
          className="h-14 flex-1 text-base"
          onClick={onNext}
          disabled={job.rooms.length === 0}
        >
          Kalkulace →
        </Button>
      </div>
    </div>
  )
}

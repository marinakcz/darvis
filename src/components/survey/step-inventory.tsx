"use client"

import { useState } from "react"
import type { Job, Room, RoomType } from "@/lib/types"
import { ROOM_LABELS } from "@/lib/types"
import { RoomIcon } from "@/components/icons"
import { getCatalogItem } from "@/lib/catalog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RoomPicker } from "@/components/inventory/room-picker"
import { RoomPanel } from "@/components/inventory/room-panel"
import { ChevronDown, ChevronUp } from "lucide-react"

interface StepInventoryProps {
  job: Job
  onChange: (updater: (prev: Job) => Job) => void
  onNext: () => void
  onBack: () => void
}

function getRoomVolume(room: Room): number {
  return room.items.reduce((sum, item) => {
    const cat = getCatalogItem(item.catalogId)
    return sum + (cat ? cat.volume * item.quantity : 0)
  }, 0)
}

export function StepInventory({ job, onChange, onNext, onBack }: StepInventoryProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null)

  function addRoom(type: RoomType) {
    const count = job.rooms.filter((r) => r.type === type).length
    const newRoom: Room = {
      id: `${type}-${Date.now()}`,
      type,
      customName: count > 0 ? `${type}-${count + 1}` : undefined,
      items: [],
    }
    onChange((prev) => ({ ...prev, rooms: [...prev.rooms, newRoom] }))
    setExpandedRoomId(newRoom.id)
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
    if (expandedRoomId === roomId) setExpandedRoomId(null)
  }

  function toggleRoom(roomId: string) {
    setExpandedRoomId((prev) => prev === roomId ? null : roomId)
  }

  return (
    <div className="flex flex-col gap-3">
      {job.rooms.length === 0 && !showPicker && (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-lg text-muted-foreground">
            Zatim nemate zadne mistnosti.
          </p>
          <p className="text-sm text-muted-foreground">
            Zacnete pridanim mistnosti, do ktere pak priradite polozky k prestehovani.
          </p>
          <Button size="lg" className="h-14 text-base" onClick={() => setShowPicker(true)}>
            + Pridat mistnost
          </Button>
        </div>
      )}

      {/* Existing rooms — accordion: collapsed summary or expanded panel */}
      {job.rooms.map((room) => {
        const isExpanded = expandedRoomId === room.id
        const hasItems = room.items.length > 0
        const volume = getRoomVolume(room)
        const Icon = RoomIcon[room.type]
        const roomLabel = ROOM_LABELS[room.type] + (room.customName ? ` (${room.customName})` : "")

        if (isExpanded) {
          return (
            <div key={room.id} className="flex flex-col gap-0">
              <button
                type="button"
                onClick={() => toggleRoom(room.id)}
                className="flex items-center justify-between rounded-t-2xl border border-b-0 border-border bg-card px-4 py-3 min-h-[44px] w-full text-left transition-colors hover:bg-accent active:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Icon className="size-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium truncate">{roomLabel}</span>
                  {hasItems && (
                    <Badge variant="secondary" className="font-mono text-xs shrink-0">
                      {room.items.length} pol. · {volume.toFixed(1)} m³
                    </Badge>
                  )}
                </div>
                <ChevronUp className="size-4 text-muted-foreground shrink-0 ml-2" />
              </button>
              <div className="border border-t-0 border-border rounded-b-2xl overflow-hidden">
                <RoomPanel
                  room={room}
                  onUpdate={(updater) => updateRoom(room.id, updater)}
                  onRemove={() => removeRoom(room.id)}
                  hideHeader
                />
              </div>
            </div>
          )
        }

        return (
          <button
            key={room.id}
            type="button"
            onClick={() => toggleRoom(room.id)}
            className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 min-h-[44px] w-full text-left transition-colors hover:bg-accent active:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Icon className="size-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium truncate">{roomLabel}</span>
              {hasItems && (
                <Badge variant="secondary" className="font-mono text-xs shrink-0">
                  {room.items.length} pol. · {volume.toFixed(1)} m³
                </Badge>
              )}
              {!hasItems && (
                <span className="text-xs text-muted-foreground">prazdna</span>
              )}
            </div>
            <ChevronDown className="size-4 text-muted-foreground shrink-0 ml-2" />
          </button>
        )
      })}

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
          + Pridat mistnost
        </Button>
      )}

      {/* Navigation */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur py-4 -mx-4 px-4 border-t border-border mt-auto">
        <div className="flex gap-3">
          <Button variant="outline" size="lg" className="h-14 flex-1" onClick={onBack}>
            &larr; Zpet
          </Button>
          <Button
            size="lg"
            className="h-14 flex-1 text-base"
            onClick={onNext}
            disabled={job.rooms.length === 0}
          >
            Prejit na kalkulaci &rarr;
          </Button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { use, useState, useCallback, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { X, Plus, ChevronDown, ChevronUp, Package } from "lucide-react"
import type { Job, SurveyRoom, RoomType, RoomMode, InventoryItem, MaterialOrder } from "@/lib/types"
import { createEmptyJob, ROOM_LABELS, MATERIAL_LABELS, MATERIAL_UNITS } from "@/lib/types"
import { getMockJobById } from "@/lib/mock-data"
import { calculateJob, formatPrice, formatVolume } from "@/lib/calculator"
import { getCatalogItem } from "@/lib/catalog"
import { VEHICLES } from "@/lib/constants"
import { RoomIcon } from "@/components/icons"
import { ActionButton, GhostButton } from "@/components/ds"
import { RoomPicker } from "@/components/inventory/room-picker"
import { RoomPanel } from "@/components/inventory/room-panel"

function storageKey(jobId: string) { return `darvis-survey-${jobId}` }

function loadJob(jobId: string): Job {
  try {
    const saved = localStorage.getItem(storageKey(jobId))
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  const mock = getMockJobById(jobId)
  if (mock) {
    const prefilled = createEmptyJob("quick")
    prefilled.client = { name: mock.client, phone: mock.phone, email: "" }
    prefilled.pickup = { address: mock.pickup, floor: mock.floor.pickup, elevator: mock.elevator.pickup }
    prefilled.delivery = { address: mock.delivery, floor: mock.floor.delivery, elevator: mock.elevator.delivery }
    prefilled.distance = mock.distance
    prefilled.date = mock.date
    prefilled.fromCRM = true
    prefilled.dispatcherNote = mock.dispatcherNote
    return prefilled
  }
  return createEmptyJob("quick")
}

function saveJobToStorage(jobId: string, job: Job) {
  try { localStorage.setItem(storageKey(jobId), JSON.stringify(job)) } catch { /* ignore */ }
}

function useIsMounted() {
  return useSyncExternalStore(() => () => {}, () => true, () => false)
}

const PERCENT_STEPS = [5, 10, 15, 20, 25, 30, 40, 50]

function autoSelectVehicle(totalVolume: number): string {
  if (totalVolume <= 15) return "small-15"
  if (totalVolume <= 20) return "small-20"
  if (totalVolume <= 24) return "medium-24"
  if (totalVolume <= 33) return "large-33"
  return "xlarge-36"
}

function getRoomVolume(room: SurveyRoom, vehicleCapacity: number): number {
  if (room.mode === "quick") return (room.percent / 100) * vehicleCapacity
  return room.items.reduce((sum, item) => {
    const cat = getCatalogItem(item.catalogId)
    return sum + (cat ? cat.volume * item.quantity : 0)
  }, 0)
}

export default function SurveyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = use(params)
  const mounted = useIsMounted()
  const router = useRouter()
  const [job, setJobState] = useState<Job>(() => loadJob(jobId))
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null)
  const [showRoomPicker, setShowRoomPicker] = useState(false)
  const [materialsExpanded, setMaterialsExpanded] = useState(false)

  const setJob = useCallback((updater: Job | ((prev: Job) => Job)) => {
    setJobState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater
      const calc = calculateJob(next)
      const suggested = autoSelectVehicle(calc.totalVolume)
      if (next.vehicleId !== suggested && next.surveyRooms.length > 0) {
        next.vehicleId = suggested as Job["vehicleId"]
      }
      saveJobToStorage(jobId, next)
      return next
    })
  }, [jobId])

  if (!mounted) return null

  const calc = calculateJob(job)
  const vehicle = VEHICLES.find((v) => v.id === job.vehicleId) ?? VEHICLES[2]
  const vehicleCapacity = vehicle.capacity
  const pickupShort = job.pickup.address.split(",")[0] || "—"
  const deliveryShort = job.delivery.address.split(",")[0] || "—"

  function addRoom(type: RoomType) {
    const newRoom: SurveyRoom = { id: `sr-${Date.now()}`, type, mode: "quick", percent: 10, items: [] }
    setJob((prev) => ({ ...prev, surveyRooms: [...prev.surveyRooms, newRoom] }))
    setExpandedRoomId(newRoom.id)
    setShowRoomPicker(false)
  }

  function updateRoom(roomId: string, updater: (room: SurveyRoom) => SurveyRoom) {
    setJob((prev) => ({ ...prev, surveyRooms: prev.surveyRooms.map((r) => (r.id === roomId ? updater(r) : r)) }))
  }

  function removeRoom(roomId: string) {
    setJob((prev) => ({ ...prev, surveyRooms: prev.surveyRooms.filter((r) => r.id !== roomId) }))
    if (expandedRoomId === roomId) setExpandedRoomId(null)
  }

  function toggleRoomMode(roomId: string) {
    updateRoom(roomId, (r) => ({ ...r, mode: r.mode === "quick" ? "detailed" : "quick" }))
  }

  function updatePercent(roomId: string, percent: number) {
    updateRoom(roomId, (r) => ({ ...r, percent }))
  }

  function toggleRoom(roomId: string) {
    setExpandedRoomId((prev) => prev === roomId ? null : roomId)
  }

  function updateMaterial(key: keyof MaterialOrder, delta: number) {
    setJob((prev) => ({ ...prev, materials: { ...prev.materials, [key]: Math.max(0, prev.materials[key] + delta) } }))
  }

  function roomPanelUpdate(roomId: string, updater: (room: { id: string; type: RoomType; customName?: string; items: InventoryItem[] }) => { id: string; type: RoomType; customName?: string; items: InventoryItem[] }) {
    updateRoom(roomId, (sr) => {
      const updated = updater({ id: sr.id, type: sr.type, customName: sr.customName, items: sr.items })
      return { ...sr, items: updated.items, customName: updated.customName }
    })
  }

  const MATERIAL_KEYS: (keyof MaterialOrder)[] = ["boxes", "crates", "stretchWrap", "bubbleWrap", "packingPaper"]
  const hasUserMaterials = Object.values(job.materials).some((v) => v > 0)
  const estimatedMaterials = calc.materials

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface-0/80 backdrop-blur-xl px-4 py-2.5">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => router.push(`/jobs/${jobId}`)} aria-label="Zavřít zaměření"
            className="flex items-center justify-center size-11 -ml-2 rounded-lg text-text-secondary hover:bg-surface-2 active:bg-surface-2 transition-colors">
            <X className="size-5" />
          </button>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-semibold truncate">{job.client.name}</span>
            <span className="text-[11px] text-text-tertiary truncate">{pickupShort} → {deliveryShort}</span>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-3 px-4 py-4 pb-40 overflow-y-auto">
        {/* Empty state */}
        {job.surveyRooms.length === 0 && !showRoomPicker && (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-lg text-text-secondary">Začněte přidáním místnosti.</p>
            <p className="text-sm text-text-tertiary">Projděte byt a přidávejte místnosti — cenu uvidíte živě dole.</p>
            <ActionButton onClick={() => setShowRoomPicker(true)} className="max-w-[240px]">
              + Přidat místnost
            </ActionButton>
          </div>
        )}

        {/* Room list */}
        {job.surveyRooms.map((room) => {
          const isExpanded = expandedRoomId === room.id
          const Icon = RoomIcon[room.type]
          const roomLabel = ROOM_LABELS[room.type] + (room.customName ? ` (${room.customName})` : "")
          const vol = getRoomVolume(room, vehicleCapacity)

          if (isExpanded) {
            return (
              <div key={room.id} className="flex flex-col gap-0">
                <button type="button" onClick={() => toggleRoom(room.id)}
                  className="flex items-center justify-between rounded-t-2xl bg-surface-1 px-4 py-3 min-h-[44px] w-full text-left transition-colors hover:bg-surface-2 active:bg-surface-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Icon className="size-4 text-text-tertiary shrink-0" />
                    <span className="text-sm font-medium truncate">{roomLabel}</span>
                    <span className="font-mono text-[10px] text-text-tertiary bg-surface-2 px-1.5 py-0.5 rounded shrink-0">
                      {room.mode === "quick" ? `${room.percent}%` : `${room.items.length} pol.`} · {vol.toFixed(1)} m³
                    </span>
                  </div>
                  <ChevronUp className="size-4 text-text-tertiary shrink-0 ml-2" />
                </button>

                <div className="bg-surface-1 rounded-b-2xl overflow-hidden">
                  <div className="px-4 py-3 flex flex-col gap-3">
                    {/* Mode toggle */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-tertiary">Režim:</span>
                      <div className="flex rounded-lg bg-surface-2 overflow-hidden">
                        <button type="button" onClick={() => toggleRoomMode(room.id)}
                          className={`px-3 py-1.5 text-xs font-medium transition-colors ${room.mode === "quick" ? "bg-success text-success-foreground" : "text-text-secondary hover:bg-surface-3"}`}>
                          Rychlý
                        </button>
                        <button type="button" onClick={() => toggleRoomMode(room.id)}
                          className={`px-3 py-1.5 text-xs font-medium transition-colors ${room.mode === "detailed" ? "bg-success text-success-foreground" : "text-text-secondary hover:bg-surface-3"}`}>
                          Detailní
                        </button>
                      </div>
                    </div>

                    {room.mode === "quick" && (
                      <div className="flex flex-wrap gap-1.5" role="group">
                        {PERCENT_STEPS.map((p) => (
                          <button key={p} type="button" onClick={() => updatePercent(room.id, p)} aria-pressed={room.percent === p}
                            className={`h-11 rounded-lg px-3 py-2 text-sm font-mono font-medium transition-colors ${
                              room.percent === p ? "bg-success text-success-foreground" : "bg-surface-2 text-text-secondary hover:bg-surface-3"
                            }`}>
                            {p}%
                          </button>
                        ))}
                      </div>
                    )}

                    {room.mode === "detailed" && (
                      <RoomPanel
                        room={{ id: room.id, type: room.type, customName: room.customName, items: room.items }}
                        onUpdate={(updater) => roomPanelUpdate(room.id, updater)}
                        onRemove={() => removeRoom(room.id)}
                        hideHeader
                      />
                    )}

                    {room.mode === "quick" && (
                      <button type="button" onClick={() => removeRoom(room.id)}
                        className="h-10 text-sm text-destructive hover:text-destructive/80 transition-colors">
                        Odebrat místnost
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          }

          return (
            <button key={room.id} type="button" onClick={() => toggleRoom(room.id)}
              className="flex items-center justify-between rounded-2xl bg-surface-1 px-4 py-3 min-h-[44px] w-full text-left transition-colors hover:bg-surface-2 active:bg-surface-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Icon className="size-4 text-text-tertiary shrink-0" />
                <span className="text-sm font-medium truncate">{roomLabel}</span>
                <span className="font-mono text-[10px] text-text-tertiary bg-surface-2 px-1.5 py-0.5 rounded shrink-0">
                  {room.mode === "quick" ? `${room.percent}%` : `${room.items.length} pol.`} · {vol.toFixed(1)} m³
                </span>
              </div>
              <ChevronDown className="size-4 text-text-tertiary shrink-0 ml-2" />
            </button>
          )
        })}

        {/* Add room */}
        {showRoomPicker ? (
          <RoomPicker onSelect={addRoom} onClose={() => setShowRoomPicker(false)} />
        ) : job.surveyRooms.length > 0 ? (
          <GhostButton onClick={() => setShowRoomPicker(true)}>
            <Plus className="size-4" /> Přidat místnost
          </GhostButton>
        ) : null}

        {/* Materials */}
        {job.surveyRooms.length > 0 && (
          <>
            <button type="button" onClick={() => setMaterialsExpanded((prev) => !prev)}
              className="flex items-center justify-between rounded-2xl bg-surface-1 px-4 py-3 min-h-[44px] w-full text-left transition-colors hover:bg-surface-2 active:bg-surface-2">
              <div className="flex items-center gap-2">
                <Package className="size-4 text-text-tertiary" />
                <span className="text-sm font-medium">Materiál</span>
                <span className="text-xs text-text-tertiary">{hasUserMaterials ? "Upraveno" : "Auto-odhad"}</span>
              </div>
              {materialsExpanded ? <ChevronUp className="size-4 text-text-tertiary" /> : <ChevronDown className="size-4 text-text-tertiary" />}
            </button>

            {materialsExpanded && (
              <div className="rounded-2xl bg-surface-2 overflow-hidden divide-y divide-border">
                <div className="px-4 py-2 text-xs text-text-tertiary">
                  {hasUserMaterials ? "Ručně zadané hodnoty" : "Automatický odhad — upravte pro přesnější kalkulaci"}
                </div>
                {MATERIAL_KEYS.map((key) => {
                  const value = hasUserMaterials ? job.materials[key] : estimatedMaterials[key]
                  return (
                    <div key={key} className="flex items-center justify-between px-4 py-2">
                      <span className="text-sm">{MATERIAL_LABELS[key]}</span>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => updateMaterial(key, -1)}
                          className="flex items-center justify-center h-9 w-9 rounded-lg bg-surface-3 text-lg text-text-secondary hover:bg-surface-3/80 transition-colors">-</button>
                        <span className="w-8 text-center font-mono text-sm">{value}</span>
                        <button type="button" onClick={() => updateMaterial(key, 1)}
                          className="flex items-center justify-center h-9 w-9 rounded-lg bg-surface-3 text-lg text-text-secondary hover:bg-surface-3/80 transition-colors">+</button>
                        <span className="text-xs text-text-tertiary w-8">{MATERIAL_UNITS[key]}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Sticky price footer */}
      <div className="sticky bottom-0 z-40 border-t border-border bg-surface-0/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 text-xs text-text-tertiary">
              <span className="font-mono">{formatVolume(calc.totalVolume)}</span>
              <span className="text-border">·</span>
              <span className="font-mono">{calc.truckCount} auto</span>
              <span className="text-border">·</span>
              <span className="font-mono">{calc.workerCount} lidi</span>
            </div>
            <span className="font-mono text-xl font-bold">{formatPrice(calc.totalPrice)}</span>
          </div>
          <ActionButton onClick={() => router.push(`/jobs/${jobId}/offer`)} disabled={job.surveyRooms.length === 0}>
            Zobrazit nabídku
          </ActionButton>
        </div>
      </div>
    </div>
  )
}

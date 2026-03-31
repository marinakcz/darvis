"use client"

import { use, useState, useCallback, useRef, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { X, Plus, ChevronDown, ChevronUp, Package, Loader2 } from "lucide-react"
import type { Job, SurveyRoom, RoomType, RoomMode, InventoryItem, MaterialOrder } from "@/lib/types"
import { createEmptyJob, ROOM_LABELS, MATERIAL_LABELS, MATERIAL_UNITS } from "@/lib/types"
import { calculateJob, formatPrice, formatVolume } from "@/lib/calculator"
import { getCatalogItem } from "@/lib/catalog"
import { VEHICLES } from "@/lib/constants"
import { RoomIcon } from "@/components/icons"
import { ActionButton, GhostButton } from "@/components/ds"
import { RoomPicker } from "@/components/inventory/room-picker"
import { RoomPanel } from "@/components/inventory/room-panel"

const PERCENT_PRESETS = [10, 20, 30, 50]

function useIsMounted() {
  return useSyncExternalStore(() => () => {}, () => true, () => false)
}

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

/** Convert DB job response to Job object for local state */
function dbJobToLocal(data: Record<string, unknown>): Job {
  const rooms = (data.rooms as Array<Record<string, unknown>>) || []
  return {
    mode: "quick",
    jobType: (data.jobType as Job["jobType"]) || "apartment",
    vehicleId: (data.vehicleId as Job["vehicleId"]) || "medium-24",
    client: data.customer
      ? {
          name: (data.customer as Record<string, string>).name || "",
          phone: (data.customer as Record<string, string>).phone || "",
          email: (data.customer as Record<string, string>).email || "",
        }
      : { name: "", phone: "", email: "" },
    pickup: {
      address: (data.pickupAddress as string) || "",
      floor: (data.pickupFloor as number) || 0,
      elevator: (data.pickupElevator as boolean) || false,
    },
    delivery: {
      address: (data.deliveryAddress as string) || "",
      floor: (data.deliveryFloor as number) || 0,
      elevator: (data.deliveryElevator as boolean) || false,
    },
    distance: Number(data.distance) || 0,
    date: (data.date as string) || "",
    rooms: [],
    quickRooms: [],
    surveyRooms: rooms.map((r): SurveyRoom => ({
      id: r.id as string,
      type: r.type as RoomType,
      customName: r.customName as string | undefined,
      mode: (r.mode as RoomMode) || "quick",
      percent: (r.percent as number) || 0,
      items: ((r.items as Array<Record<string, unknown>>) || []).map((i): InventoryItem => ({
        id: i.id as string,
        catalogId: i.catalogId as string,
        quantity: (i.quantity as number) || 1,
        services: {
          disassembly: (i.disassembly as boolean) || false,
          packing: (i.packing as boolean) || false,
          assembly: (i.assembly as boolean) || false,
        },
        notes: i.notes as string | undefined,
      })),
    })),
    materials: (data.materials as Job["materials"]) || { boxes: 0, crates: 0, stretchWrap: 0, bubbleWrap: 0, packingPaper: 0 },
    access: (data.access as Job["access"]) || { parking: "easy", narrowPassage: false, narrowNote: "", entryDistance: "short" },
    fromCRM: (data.fromCRM as boolean) || false,
    technicianNotes: data.technicianNotes as string | undefined,
    dispatcherNote: data.dispatcherNote as string | undefined,
  }
}

export default function SurveyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = use(params)
  const mounted = useIsMounted()
  const router = useRouter()
  const [job, setJobState] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null)
  const [showRoomPicker, setShowRoomPicker] = useState(false)
  const [materialsExpanded, setMaterialsExpanded] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load job from DB
  if (mounted && !loaded) {
    setLoaded(true)
    fetch(`/api/jobs/${jobId}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found")
        return r.json()
      })
      .then((data) => {
        setJobState(dbJobToLocal(data))
        setLoading(false)
      })
      .catch(() => {
        setJobState(createEmptyJob("quick"))
        setLoading(false)
      })
  }

  /** Debounced save to DB (800ms) */
  const saveToDb = useCallback(
    (updatedJob: Job) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        setSaving(true)
        fetch(`/api/jobs/${jobId}/survey`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobType: updatedJob.jobType,
            vehicleId: updatedJob.vehicleId,
            pickup: updatedJob.pickup,
            delivery: updatedJob.delivery,
            distance: updatedJob.distance,
            access: updatedJob.access,
            date: updatedJob.date,
            materials: updatedJob.materials,
            technicianNotes: updatedJob.technicianNotes,
            surveyRooms: updatedJob.surveyRooms,
            status: "survey",
          }),
        })
          .then(() => setSaving(false))
          .catch(() => setSaving(false))
      }, 800)
    },
    [jobId],
  )

  const setJob = useCallback(
    (updater: Job | ((prev: Job) => Job)) => {
      setJobState((prev) => {
        if (!prev) return prev
        const next = typeof updater === "function" ? updater(prev) : updater
        const calc = calculateJob(next)
        const suggested = autoSelectVehicle(calc.totalVolume)
        if (next.vehicleId !== suggested && next.surveyRooms.length > 0) {
          next.vehicleId = suggested as Job["vehicleId"]
        }
        saveToDb(next)
        return next
      })
    },
    [saveToDb],
  )

  if (!mounted || loading || !job) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-text-tertiary" />
      </div>
    )
  }

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

  /** Přidá preset % k aktuálnímu součtu */
  function addPreset(roomId: string, preset: number) {
    updateRoom(roomId, (r) => ({ ...r, percent: r.percent + preset }))
  }

  /** Nastaví % přímo (ruční override) */
  function setPercent(roomId: string, percent: number) {
    updateRoom(roomId, (r) => ({ ...r, percent: Math.max(0, percent) }))
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
            <span className="text-sm font-semibold truncate">{job.client.name || "Nová zakázka"}</span>
            <span className="text-[11px] text-text-tertiary truncate">{pickupShort} → {deliveryShort}</span>
          </div>
          {saving && <Loader2 className="size-4 animate-spin text-text-tertiary shrink-0" />}
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
                <button type="button" onClick={() => toggleRoom(room.id)} aria-expanded={true}
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
                        <button type="button" onClick={() => toggleRoomMode(room.id)} aria-pressed={room.mode === "quick"}
                          className={`px-3 py-2 text-xs font-medium min-h-[44px] transition-colors ${room.mode === "quick" ? "bg-success text-success-foreground" : "text-text-secondary hover:bg-surface-3"}`}>
                          Rychlý
                        </button>
                        <button type="button" onClick={() => toggleRoomMode(room.id)} aria-pressed={room.mode === "detailed"}
                          className={`px-3 py-2 text-xs font-medium min-h-[44px] transition-colors ${room.mode === "detailed" ? "bg-success text-success-foreground" : "text-text-secondary hover:bg-surface-3"}`}>
                          Detailní
                        </button>
                      </div>
                    </div>

                    {room.mode === "quick" && (
                      <div className="flex flex-col gap-3">
                        {/* Aktuální hodnota — editovatelný chip */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text-tertiary">Zaplnění:</span>
                          <div className="flex items-center gap-1 bg-surface-2 rounded-lg px-2 py-1">
                            <input
                              type="number"
                              value={room.percent}
                              onChange={(e) => setPercent(room.id, parseInt(e.target.value) || 0)}
                              className="w-14 bg-transparent text-center text-lg font-mono font-bold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              min={0}
                              max={999}
                            />
                            <span className="text-sm font-mono text-text-secondary">%</span>
                          </div>
                          {room.percent > 0 && (
                            <button type="button" onClick={() => setPercent(room.id, 0)}
                              className="flex items-center justify-center size-8 rounded-lg text-text-tertiary hover:bg-surface-3 hover:text-destructive transition-colors">
                              <X className="size-3.5" />
                            </button>
                          )}
                        </div>
                        {/* Preset buttony — klikáním se přidávají */}
                        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Přidat procenta">
                          {PERCENT_PRESETS.map((p) => (
                            <button key={p} type="button" onClick={() => addPreset(room.id, p)}
                              className="h-11 rounded-lg px-4 py-2 text-sm font-mono font-medium bg-surface-2 text-text-secondary hover:bg-success hover:text-success-foreground active:bg-success active:text-success-foreground transition-colors">
                              +{p}%
                            </button>
                          ))}
                        </div>
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
            <button key={room.id} type="button" onClick={() => toggleRoom(room.id)} aria-expanded={false}
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
            <button type="button" onClick={() => setMaterialsExpanded((prev) => !prev)} aria-expanded={materialsExpanded}
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
                          className="flex items-center justify-center h-11 w-11 rounded-lg bg-surface-3 text-lg text-text-secondary hover:bg-surface-3/80 transition-colors">-</button>
                        <span className="w-8 text-center font-mono text-sm">{value}</span>
                        <button type="button" onClick={() => updateMaterial(key, 1)}
                          className="flex items-center justify-center h-11 w-11 rounded-lg bg-surface-3 text-lg text-text-secondary hover:bg-surface-3/80 transition-colors">+</button>
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
            <span className="font-mono text-xl font-bold">{job.surveyRooms.length > 0 ? formatPrice(calc.totalPrice) : "—"}</span>
          </div>
          <ActionButton onClick={() => router.push(`/jobs/${jobId}/offer`)} disabled={job.surveyRooms.length === 0}>
            Zobrazit nabídku
          </ActionButton>
        </div>
      </div>
    </div>
  )
}

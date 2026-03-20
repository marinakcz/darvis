"use client"

import { useState, type RefObject } from "react"
import { Button } from "@/components/ui/button"
import { X, Check, MessageSquarePlus, Eye, EyeOff } from "lucide-react"
import type { FeedbackEntry, PublicFeedbackEntry } from "@/lib/feedback"

type AnyPin = FeedbackEntry | PublicFeedbackEntry

interface PinOverlayProps {
  active: boolean
  pins: AnyPin[]
  onAddPin: (pin: { x: number; y: number; scrollY: number; contentHeight: number; message: string; page: string }) => void
  containerRef: RefObject<HTMLDivElement | null>
  onDeactivate?: () => void
}

export function PinOverlay({ active, pins, onAddPin, containerRef, onDeactivate }: PinOverlayProps) {
  const [newPin, setNewPin] = useState<{ x: number; y: number; screenX: number; screenY: number } | null>(null)
  const [comment, setComment] = useState("")
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [showResolved, setShowResolved] = useState(false)

  const visiblePins = pins.filter((p) => {
    const status = "status" in p ? p.status : undefined
    if (showResolved) return true
    return status !== "done"
  })

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!active) return
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    // Y = scroll-relative: scrollTop + click position relative to container top
    const y = container.scrollTop + (e.clientY - rect.top)

    // Store both content-relative (for pin marker) and viewport (for form positioning)
    setNewPin({ x, y, screenX: e.clientX, screenY: e.clientY })
    setComment("")
  }

  function handleSubmit() {
    if (!newPin || comment.length < 1) return
    const container = containerRef.current
    onAddPin({
      x: newPin.x,
      y: newPin.y,
      scrollY: container?.scrollTop ?? 0,
      contentHeight: container?.scrollHeight ?? 0,
      message: comment,
      page: typeof window !== "undefined" ? window.location.pathname + window.location.search : "",
    })
    setNewPin(null)
    setComment("")
  }

  return (
    <>
      {/* Click catcher — only when active */}
      {active && (
        <div
          className="absolute inset-0 z-30 cursor-crosshair"
          style={{ height: containerRef.current?.scrollHeight ?? "100%" }}
          onClick={handleOverlayClick}
        />
      )}

      {/* Existing pins */}
      {visiblePins.map((pin, index) => {
        if (pin.x === null || pin.y === null) return null
        const isDone = "status" in pin && pin.status === "done"
        return (
          <div
            key={pin.id}
            className="absolute z-40"
            style={{ left: `${pin.x}%`, top: `${pin.y}px`, transform: "translate(-50%, -50%)" }}
            onMouseEnter={() => setHoveredId(pin.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={(e) => {
              e.stopPropagation()
              setHoveredId(hoveredId === pin.id ? null : pin.id)
            }}
          >
            <div
              className={`flex items-center justify-center rounded-full text-[10px] font-bold shadow-lg transition-transform hover:scale-125 ${
                isDone
                  ? "h-5 w-5 bg-emerald-500 text-white"
                  : "h-6 w-6 bg-blue-500 text-white"
              }`}
            >
              {isDone ? <Check className="size-3" /> : index + 1}
            </div>

            {/* Tooltip on hover/tap */}
            {hoveredId === pin.id && (
              <div className="absolute left-8 top-0 z-50 w-48 rounded-lg border border-zinc-700 bg-zinc-900 p-2.5 shadow-xl text-xs">
                <p className="text-zinc-200 leading-relaxed">{pin.message}</p>
                {pin.author && (
                  <p className="text-zinc-500 mt-1">-- {pin.author}</p>
                )}
                <p className="text-zinc-600 mt-1 font-mono text-[10px]">
                  {new Date(pin.createdAt).toLocaleDateString("cs-CZ")}
                </p>
              </div>
            )}
          </div>
        )
      })}

      {/* New pin form */}
      {newPin && (
        <>
          {/* Pin marker */}
          <div
            className="absolute z-40"
            style={{ left: `${newPin.x}%`, top: `${newPin.y}px`, transform: "translate(-50%, -50%)" }}
          >
            <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center animate-pulse">
              <MessageSquarePlus className="size-3" />
            </div>
          </div>

          {/* Comment form — fixed to viewport so it doesn't clip */}
          <div
            className="fixed z-[100] w-56"
            style={{
              left: Math.min(newPin.screenX + 16, window.innerWidth - 240),
              top: Math.max(newPin.screenY - 80, 16),
            }}
          >
            <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-3 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-zinc-300">Komentář</span>
                <button onClick={() => setNewPin(null)} className="text-zinc-500 hover:text-zinc-300">
                  <X className="size-3.5" />
                </button>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Co tu chcete změnit?"
                rows={3}
                autoFocus
                className="w-full resize-none rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              />
              <Button
                size="sm"
                className="w-full mt-2 h-7 text-xs"
                onClick={(e) => { e.stopPropagation(); handleSubmit() }}
                disabled={comment.length < 1}
              >
                Přidat
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Pin count indicator */}
      {pins.length > 0 && (
        <div className="absolute top-2 right-2 z-40 flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setShowResolved(!showResolved) }}
            className="flex items-center gap-1 rounded-full bg-zinc-900/80 px-2 py-0.5 text-[10px] text-zinc-400 backdrop-blur"
          >
            {showResolved ? <EyeOff className="size-2.5" /> : <Eye className="size-2.5" />}
            {pins.filter((p) => !("status" in p && p.status === "done")).length}
          </button>
        </div>
      )}

      {/* Active mode indicator (mobile) */}
      {active && onDeactivate && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 lg:hidden">
          <button
            onClick={onDeactivate}
            className="flex items-center gap-1.5 rounded-full border border-blue-500/50 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400 backdrop-blur shadow-lg"
          >
            <X className="size-3.5" />
            Ukončit komentování
          </button>
        </div>
      )}
    </>
  )
}

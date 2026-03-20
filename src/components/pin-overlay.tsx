"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Check, MessageSquarePlus, Eye, EyeOff } from "lucide-react"

interface Pin {
  id: string
  x: number
  y: number
  comment: string
  author?: string | null
  resolved: boolean
  createdAt: string
}

interface PinOverlayProps {
  active: boolean
  pins: Pin[]
  onAddPin: (pin: { x: number; y: number; comment: string; page: string }) => void
}

export function PinOverlay({ active, pins, onAddPin }: PinOverlayProps) {
  const [newPin, setNewPin] = useState<{ x: number; y: number } | null>(null)
  const [comment, setComment] = useState("")
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [showResolved, setShowResolved] = useState(false)

  const visiblePins = pins.filter((p) => showResolved || !p.resolved)

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!active) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setNewPin({ x, y })
    setComment("")
  }

  function handleSubmit() {
    if (!newPin || comment.length < 1) return
    onAddPin({
      x: newPin.x,
      y: newPin.y,
      comment,
      page: typeof window !== "undefined" ? window.location.search : "",
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
          onClick={handleOverlayClick}
        />
      )}

      {/* Existing pins */}
      {visiblePins.map((pin, index) => (
        <div
          key={pin.id}
          className="absolute z-40"
          style={{ left: `${pin.x}%`, top: `${pin.y}%`, transform: "translate(-50%, -50%)" }}
          onMouseEnter={() => setHoveredId(pin.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <div
            className={`flex items-center justify-center rounded-full text-[10px] font-bold shadow-lg transition-transform hover:scale-125 ${
              pin.resolved
                ? "h-5 w-5 bg-emerald-500 text-white"
                : "h-6 w-6 bg-blue-500 text-white"
            }`}
          >
            {pin.resolved ? <Check className="size-3" /> : index + 1}
          </div>

          {/* Tooltip on hover */}
          {hoveredId === pin.id && (
            <div className="absolute left-8 top-0 z-50 w-48 rounded-lg border border-zinc-700 bg-zinc-900 p-2.5 shadow-xl text-xs">
              <p className="text-zinc-200 leading-relaxed">{pin.comment}</p>
              {pin.author && (
                <p className="text-zinc-500 mt-1">— {pin.author}</p>
              )}
              <p className="text-zinc-600 mt-1 font-mono text-[10px]">
                {new Date(pin.createdAt).toLocaleDateString("cs-CZ")}
              </p>
            </div>
          )}
        </div>
      ))}

      {/* New pin form */}
      {newPin && (
        <>
          {/* Pin marker */}
          <div
            className="absolute z-40"
            style={{ left: `${newPin.x}%`, top: `${newPin.y}%`, transform: "translate(-50%, -50%)" }}
          >
            <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center animate-pulse">
              <MessageSquarePlus className="size-3" />
            </div>
          </div>

          {/* Comment form */}
          <div
            className="absolute z-50 w-56"
            style={{
              left: `${Math.min(newPin.x + 3, 60)}%`,
              top: `${newPin.y}%`,
              transform: "translateY(-50%)",
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
            {pins.filter((p) => !p.resolved).length}
          </button>
        </div>
      )}
    </>
  )
}

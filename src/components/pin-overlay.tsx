"use client"

import { useState, type RefObject } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { X, Check, MessageSquarePlus, Eye, EyeOff, ArrowUp } from "lucide-react"
import type { FeedbackEntry, PublicFeedbackEntry } from "@/lib/feedback"

type AnyPin = FeedbackEntry | PublicFeedbackEntry

interface PinOverlayProps {
  active: boolean
  pins: AnyPin[]
  onAddPin: (pin: { x: number; y: number; scrollY: number; contentHeight: number; message: string; page: string; author?: string }) => void
  containerRef: RefObject<HTMLDivElement | null>
  onDeactivate?: () => void
}

function getStoredAuthor(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("darvis-pin-author") || ""
}

function storeAuthor(name: string) {
  if (typeof window === "undefined") return
  localStorage.setItem("darvis-pin-author", name)
}

/** Teardrop / map-pin shape via SVG */
function PinMarker({ children, className, size = 28 }: { children?: React.ReactNode; className?: string; size?: number }) {
  return (
    <div className={`relative ${className || ""}`} style={{ width: size, height: size * 1.35 }}>
      <svg
        viewBox="0 0 28 38"
        width={size}
        height={size * 1.35}
        className="absolute inset-0"
        fill="currentColor"
      >
        <path d="M14 0C6.268 0 0 6.268 0 14c0 7.732 14 24 14 24s14-16.268 14-24C28 6.268 21.732 0 14 0z" />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: size * 0.3 }}>
          {children}
        </div>
      )}
    </div>
  )
}

export function PinOverlay({ active, pins, onAddPin, containerRef, onDeactivate }: PinOverlayProps) {
  const [newPin, setNewPin] = useState<{ x: number; y: number } | null>(null)
  const [comment, setComment] = useState("")
  const [author, setAuthor] = useState(getStoredAuthor)
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

    setNewPin({ x, y })
    setComment("")
  }

  function handleSubmit() {
    if (!newPin || comment.length < 1) return
    if (author) storeAuthor(author)
    const container = containerRef.current
    onAddPin({
      x: newPin.x,
      y: newPin.y,
      scrollY: container?.scrollTop ?? 0,
      contentHeight: container?.scrollHeight ?? 0,
      message: comment,
      page: typeof window !== "undefined" ? window.location.pathname + window.location.search : "",
      author: author || undefined,
    })
    setNewPin(null)
    setComment("")
  }

  // Nothing visible when pin mode is off
  if (!active && !newPin) return null

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

      {/* Existing pins — only visible in pin mode */}
      {visiblePins.map((pin, index) => {
        if (pin.x === null || pin.y === null) return null
        const isDone = "status" in pin && pin.status === "done"
        return (
          <div
            key={pin.id}
            data-pin-id={pin.id}
            className="absolute z-40"
            style={{ left: `${pin.x}%`, top: `${pin.y}px`, transform: "translate(-50%, -100%)" }}
            onMouseEnter={() => setHoveredId(pin.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={(e) => {
              e.stopPropagation()
              setHoveredId(hoveredId === pin.id ? null : pin.id)
            }}
          >
            <PinMarker
              className={`transition-transform hover:scale-125 ${isDone ? "text-emerald-500" : "text-blue-500"}`}
              size={isDone ? 22 : 26}
            >
              <span className="text-white text-[10px] font-bold">
                {isDone ? <Check className="size-3" /> : index + 1}
              </span>
            </PinMarker>

            {/* Tooltip — rendered via portal to avoid overflow clipping */}
            {hoveredId === pin.id && typeof document !== "undefined" && (() => {
              const pinEl = document.querySelector(`[data-pin-id="${pin.id}"]`)
              const rect = pinEl?.getBoundingClientRect()
              if (!rect) return null
              return createPortal(
                <div
                  className="fixed w-52 rounded-lg border border-zinc-700 bg-zinc-900 p-3 shadow-2xl text-xs pointer-events-none"
                  style={{
                    left: Math.min(rect.right + 8, window.innerWidth - 220),
                    top: rect.top,
                    zIndex: 9999,
                  }}
                >
                  <p className="text-zinc-200 leading-relaxed">{pin.message}</p>
                  {pin.author && (
                    <p className="text-zinc-500 mt-1.5">-- {pin.author}</p>
                  )}
                  <p className="text-zinc-600 mt-1 font-mono text-[10px]">
                    {new Date(pin.createdAt).toLocaleDateString("cs-CZ")}
                  </p>
                </div>,
                document.body
              )
            })()}
          </div>
        )
      })}

      {/* New pin form */}
      {newPin && (
        <>
          {/* Pin marker */}
          <div
            className="absolute z-40"
            style={{ left: `${newPin.x}%`, top: `${newPin.y}px`, transform: "translate(-50%, -100%)" }}
          >
            <PinMarker className="text-blue-500 animate-pulse" size={26}>
              <span className="text-white">
                <MessageSquarePlus className="size-3" />
              </span>
            </PinMarker>
          </div>

          {/* Comment form -- positioned next to the pin */}
          <div
            className="absolute z-[60] w-60"
            style={{
              left: `${Math.min(newPin.x + 4, 35)}%`,
              top: `${newPin.y - 10}px`,
            }}
          >
            <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-200">Komentář</span>
                <button onClick={() => setNewPin(null)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                  <X className="size-3.5" />
                </button>
              </div>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Jméno (volitelné)"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none mb-2"
                onClick={(e) => e.stopPropagation()}
              />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Co tu chcete změnit?"
                rows={3}
                autoFocus
                className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              />
              <Button
                size="sm"
                className="w-full mt-3 h-8 text-xs gap-1.5 rounded-lg"
                onClick={(e) => { e.stopPropagation(); handleSubmit() }}
                disabled={comment.length < 1}
              >
                <ArrowUp className="size-3.5" />
                Odeslat
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

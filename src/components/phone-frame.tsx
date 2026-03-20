"use client"

import { useSyncExternalStore, useCallback, useState, useRef } from "react"
import { ClientTopBar } from "@/components/client-top-bar"
import { PinOverlay } from "@/components/pin-overlay"
import { submitPin } from "@/lib/feedback"
import type { FeedbackEntry, PublicFeedbackEntry } from "@/lib/feedback"
import { MessageSquarePlus, MessageSquareOff } from "lucide-react"

const PHONE_W = 375
const PHONE_H = 812
const BEZEL = 26
const TOTAL_W = PHONE_W + BEZEL
const TOTAL_H = PHONE_H + BEZEL
const TOP_BAR_H = 56

type AnyPin = FeedbackEntry | PublicFeedbackEntry

// Global pin mode store (driven by events from FeedbackButton)
let _pinMode = false
const _listeners = new Set<() => void>()

function setPinModeGlobal(value: boolean) {
  _pinMode = value
  _listeners.forEach((l) => l())
}

function subscribePinMode(cb: () => void) {
  _listeners.add(cb)
  // Listen for global events
  const onEnable = () => setPinModeGlobal(true)
  const onDisable = () => setPinModeGlobal(false)
  window.addEventListener("darvis:pin-mode-on", onEnable)
  window.addEventListener("darvis:pin-mode-off", onDisable)

  // Keyboard shortcuts: C = enable pin mode, V or Esc = disable
  const onKeyDown = (e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement)?.tagName
    if (tag === "INPUT" || tag === "TEXTAREA") return
    if (e.ctrlKey || e.metaKey || e.altKey) return

    if (e.key === "c" || e.key === "C") {
      e.preventDefault()
      setPinModeGlobal(true)
    }
    if (e.key === "v" || e.key === "V" || e.key === "Escape") {
      e.preventDefault()
      setPinModeGlobal(false)
    }
  }
  window.addEventListener("keydown", onKeyDown)

  return () => {
    _listeners.delete(cb)
    window.removeEventListener("darvis:pin-mode-on", onEnable)
    window.removeEventListener("darvis:pin-mode-off", onDisable)
    window.removeEventListener("keydown", onKeyDown)
  }
}

function usePinMode() {
  return useSyncExternalStore(
    subscribePinMode,
    () => _pinMode,
    () => false,
  )
}

function usePhoneScale() {
  const subscribe = useCallback((cb: () => void) => {
    window.addEventListener("resize", cb)
    return () => window.removeEventListener("resize", cb)
  }, [])

  return useSyncExternalStore(
    subscribe,
    () => {
      const pad = 80
      const scaleH = (window.innerHeight - TOP_BAR_H - pad) / TOTAL_H
      const scaleW = (window.innerWidth - pad) / TOTAL_W
      return Math.min(1, scaleH, scaleW)
    },
    () => 1,
  )
}

export function PhoneFrame({ children, tabBar }: { children: React.ReactNode; tabBar?: React.ReactNode }) {
  const scale = usePhoneScale()
  const pinMode = usePinMode()
  const [allPins, setAllPins] = useState<AnyPin[]>([])
  const [pinsLoaded, setPinsLoaded] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const mobileContentRef = useRef<HTMLDivElement>(null)

  // Load all pins once
  if (!pinsLoaded) {
    setPinsLoaded(true)
    fetch("/api/feedback")
      .then((r) => r.json())
      .then((data: AnyPin[]) => {
        setAllPins(data.filter((e) => e.kind === "pin" && e.x !== null && e.x !== undefined))
      })
      .catch(() => {})
  }

  // Current page for filtering — re-read on every render (URL changes via Next.js router)
  const currentPage = typeof window !== "undefined"
    ? window.location.pathname + window.location.search
    : ""

  const pins = allPins.filter((p) => p.page === currentPage)

  function handleAddPin(pin: { x: number; y: number; scrollY: number; contentHeight: number; message: string; page: string; author?: string }) {
    // Optimistic: add temp pin
    const tempId = `temp-${Date.now()}`
    const tempPin: AnyPin = {
      id: tempId,
      kind: "pin",
      message: pin.message,
      type: null,
      page: pin.page,
      x: pin.x,
      y: pin.y,
      scrollY: pin.scrollY,
      contentHeight: pin.contentHeight,
      author: pin.author || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolvedAt: null,
    }
    setAllPins((prev) => [...prev, tempPin])

    submitPin(pin).then((saved) => {
      if (saved) {
        setAllPins((prev) => prev.map((p) => (p.id === tempId ? saved : p)))
      }
    })
  }

  function handleDeactivate() {
    setPinModeGlobal(false)
    window.dispatchEvent(new Event("darvis:pin-mode-off"))
  }

  return (
    <>
      {/* Mobile: render directly with pin overlay */}
      <div className="flex flex-1 flex-col lg:hidden">
        <div ref={mobileContentRef} className="flex flex-1 flex-col overflow-y-auto relative">
          <PinOverlay
            active={pinMode}
            pins={pins}
            onAddPin={handleAddPin}
            containerRef={mobileContentRef}
            onDeactivate={handleDeactivate}
          />
          {children}
        </div>
        {tabBar}
        {/* Mobile comment toggle button */}
        <button
          type="button"
          onClick={() => {
            if (pinMode) {
              handleDeactivate()
            } else {
              setPinModeGlobal(true)
            }
          }}
          aria-label={pinMode ? "Ukončit režim komentářů" : "Zapnout režim komentářů"}
          aria-pressed={pinMode}
          className={`fixed bottom-4 right-4 z-50 flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium shadow-lg transition-colors lg:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            pinMode
              ? "border border-blue-500/50 bg-blue-500/10 text-blue-400 backdrop-blur"
              : "border border-zinc-700 bg-zinc-900 text-zinc-400 backdrop-blur hover:bg-zinc-800"
          }`}
        >
          {pinMode ? <MessageSquareOff className="size-4" /> : <MessageSquarePlus className="size-4" />}
          {pinMode ? "Ukončit" : "Komentář"}
        </button>
      </div>

      {/* Desktop: top bar + centered phone */}
      <div className="hidden lg:flex flex-1 flex-col bg-zinc-950">
        <ClientTopBar />

        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <div
            style={{
              width: TOTAL_W * scale,
              height: TOTAL_H * scale,
            }}
          >
            <div
              className="relative origin-top-left"
              style={{ transform: `scale(${scale})` }}
            >
              {/* Phone body */}
              <div
                className="relative rounded-[52px] border-[3px] border-zinc-600 bg-zinc-900 p-[10px] shadow-[0_0_100px_rgba(255,255,255,0.03),0_0_40px_rgba(0,0,0,0.8)]"
                style={{ width: PHONE_W, height: PHONE_H }}
              >
                <div className="relative h-full w-full overflow-hidden rounded-[42px] bg-background">
                  {/* Dynamic Island */}
                  <div className="absolute left-1/2 top-[10px] z-50 h-[33px] w-[120px] -translate-x-1/2 rounded-full bg-black" />
                  {/* Home indicator */}
                  <div className="absolute bottom-[6px] left-1/2 z-50 h-[5px] w-[130px] -translate-x-1/2 rounded-full bg-zinc-600" />

                  {/* Screen — flex column: scrollable content + fixed tab bar */}
                  <div className="flex h-full flex-col pt-[12px] pb-[20px]">
                    <div
                      ref={contentRef}
                      className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden relative"
                    >
                      <PinOverlay
                        active={pinMode}
                        pins={pins}
                        onAddPin={handleAddPin}
                        containerRef={contentRef}
                        onDeactivate={handleDeactivate}
                      />
                      {children}
                    </div>
                    {tabBar}
                  </div>
                </div>

              {/* Side buttons */}
              <div className="absolute -left-[5px] top-[155px] h-[28px] w-[4px] rounded-l-sm bg-zinc-600" />
              <div className="absolute -left-[5px] top-[200px] h-[52px] w-[4px] rounded-l-sm bg-zinc-600" />
              <div className="absolute -left-[5px] top-[264px] h-[52px] w-[4px] rounded-l-sm bg-zinc-600" />
              <div className="absolute -right-[5px] top-[220px] h-[76px] w-[4px] rounded-r-sm bg-zinc-600" />
              </div>
            </div>
          </div>

          {/* Actions under phone */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("darvis-job")
                window.location.href = "/survey?step=0"
              }}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-zinc-700/50 px-5 py-2.5 text-sm text-zinc-400 font-medium transition-colors hover:border-zinc-600 hover:text-zinc-200 hover:bg-zinc-800/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              ↺ Začít znova
            </button>
            <button
              type="button"
              onClick={() => {
                if (pinMode) {
                  handleDeactivate()
                } else {
                  setPinModeGlobal(true)
                }
              }}
              aria-label={pinMode ? "Ukončit režim komentářů" : "Zapnout režim komentářů"}
              aria-pressed={pinMode}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                pinMode
                  ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                  : "border-zinc-700/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              {pinMode ? <MessageSquareOff className="size-4" /> : <MessageSquarePlus className="size-4" />}
              {pinMode ? "Ukončit" : "Komentář"}
              <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 ml-1 text-[10px] text-zinc-500 font-mono leading-none">
                {pinMode ? "V" : "C"}
              </kbd>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

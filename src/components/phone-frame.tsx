"use client"

import { useSyncExternalStore, useCallback, useState } from "react"
import { ClientTopBar } from "@/components/client-top-bar"
import { PinOverlay } from "@/components/pin-overlay"
import { MessageSquarePlus, MessageSquareOff } from "lucide-react"

const PHONE_W = 375
const PHONE_H = 812
const BEZEL = 26
const TOTAL_W = PHONE_W + BEZEL
const TOTAL_H = PHONE_H + BEZEL
const TOP_BAR_H = 56

interface Pin {
  id: string
  x: number
  y: number
  comment: string
  author?: string | null
  resolved: boolean
  createdAt: string
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

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  const scale = usePhoneScale()
  const [pinMode, setPinMode] = useState(false)
  const [pins, setPins] = useState<Pin[]>([])
  const [pinsLoaded, setPinsLoaded] = useState(false)

  // Load pins once
  if (!pinsLoaded) {
    setPinsLoaded(true)
    fetch("/api/pins")
      .then((r) => r.json())
      .then((data) => setPins(data))
      .catch(() => {})
  }

  function handleAddPin(pin: { x: number; y: number; comment: string; page: string }) {
    fetch("/api/pins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pin),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok !== false) {
          setPins((prev) => [...prev, data])
        }
      })
      .catch(() => {})
  }

  return (
    <>
      {/* Mobile: render directly */}
      <div className="flex flex-1 flex-col lg:hidden">{children}</div>

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

                  {/* Pin overlay */}
                  <PinOverlay active={pinMode} pins={pins} onAddPin={handleAddPin} />

                  {/* Screen */}
                  <div className="flex h-full flex-col overflow-y-auto overflow-x-hidden pt-[12px] pb-[20px]">
                    {children}
                  </div>
                </div>
              </div>

              {/* Side buttons */}
              <div className="absolute -left-[5px] top-[155px] h-[28px] w-[4px] rounded-l-sm bg-zinc-600" />
              <div className="absolute -left-[5px] top-[200px] h-[52px] w-[4px] rounded-l-sm bg-zinc-600" />
              <div className="absolute -left-[5px] top-[264px] h-[52px] w-[4px] rounded-l-sm bg-zinc-600" />
              <div className="absolute -right-[5px] top-[220px] h-[76px] w-[4px] rounded-r-sm bg-zinc-600" />
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
              className="rounded-lg border border-zinc-700/50 px-5 py-2 text-sm text-zinc-400 font-medium transition-colors hover:border-zinc-600 hover:text-zinc-200 hover:bg-zinc-800/50"
            >
              ↺ Začít znova
            </button>

            {/* Pin mode toggle */}
            <button
              type="button"
              onClick={() => setPinMode(!pinMode)}
              className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                pinMode
                  ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                  : "border-zinc-700/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              {pinMode ? <MessageSquareOff className="size-4" /> : <MessageSquarePlus className="size-4" />}
              {pinMode ? "Ukončit komentování" : "Komentovat"}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

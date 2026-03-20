"use client"

import { useSyncExternalStore, useCallback } from "react"
import { ClientTopBar } from "@/components/client-top-bar"

const PHONE_W = 375
const PHONE_H = 812
const BEZEL = 8
const TOTAL_W = PHONE_W + BEZEL
const TOTAL_H = PHONE_H + BEZEL
const TOP_BAR_H = 56

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

  return (
    <>
      {/* Mobile: render directly */}
      <div className="flex flex-1 flex-col lg:hidden">
        <div className="flex flex-1 flex-col overflow-y-auto">
          {children}
        </div>
        {tabBar}
      </div>

      {/* Desktop: top bar + centered phone */}
      <div className="hidden lg:flex flex-1 flex-col bg-zinc-950">
        <ClientTopBar />

        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <div style={{ width: TOTAL_W * scale, height: TOTAL_H * scale }}>
            <div className="relative origin-top-left" style={{ transform: `scale(${scale})` }}>
              <div
                className="relative rounded-[24px] border-[2px] border-zinc-700 bg-background shadow-[0_0_80px_rgba(0,0,0,0.6)]"
                style={{ width: PHONE_W, height: PHONE_H }}
              >
                <div className="relative h-full w-full overflow-hidden rounded-[22px]">
                  <div className="flex h-full flex-col">
                    <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                      {children}
                    </div>
                    {tabBar}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reset button */}
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("darvis-job")
              window.location.href = "/survey?step=0"
            }}
            className="rounded-lg border border-zinc-700/50 px-5 py-2.5 text-sm text-zinc-400 font-medium transition-colors hover:border-zinc-600 hover:text-zinc-200 hover:bg-zinc-800/50"
          >
            ↺ Začít znova
          </button>
        </div>
      </div>
    </>
  )
}

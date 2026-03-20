"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip"
import { DevLog } from "@/components/dev-log"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ListChecks, Lock, ShieldCheck } from "lucide-react"

function AdminPinModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [digits, setDigits] = useState(["", "", "", ""])
  const [error, setError] = useState(false)

  function handleInput(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    setError(false)

    if (digit && index < 3) {
      document.getElementById(`admin-pin-${index + 1}`)?.focus()
    }

    const fullPin = next.join("")
    if (fullPin.length === 4 && next.every((d) => d !== "")) {
      fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: fullPin }),
      }).then((res) => {
        if (res.ok) {
          sessionStorage.setItem("darvis-admin-pin", "ok")
          window.location.href = "/admin/feedback"
        } else {
          setError(true)
          setDigits(["", "", "", ""])
          document.getElementById("admin-pin-0")?.focus()
        }
      })
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      document.getElementById(`admin-pin-${index - 1}`)?.focus()
      const next = [...digits]
      next[index - 1] = ""
      setDigits(next)
    }
    if (e.key === "Escape") onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex flex-col items-center gap-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
        <Lock className="size-6 text-zinc-500" />
        <h2 className="text-base font-semibold text-zinc-200">Admin PIN</h2>

        <div className="flex gap-3">
          {digits.map((digit, i) => (
            <input
              key={i}
              id={`admin-pin-${i}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit ? "\u2022" : ""}
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              autoFocus={i === 0}
              className={`w-12 h-14 text-center text-xl rounded-xl border-2 bg-zinc-950 outline-none transition-all ${
                error
                  ? "border-red-500/50 bg-red-500/5"
                  : digit
                    ? "border-zinc-500 bg-zinc-800"
                    : "border-zinc-700 focus:border-zinc-500"
              }`}
            />
          ))}
        </div>

        {error && <p className="text-sm text-red-400">Nesprávný PIN</p>}
      </div>
    </div>
  )
}

export function ClientTopBar() {
  const [showPin, setShowPin] = useState(false)

  function handleAdminClick() {
    // If already authenticated in this session, go directly
    if (sessionStorage.getItem("darvis-admin-pin") === "ok") {
      window.location.href = "/admin/feedback"
    } else {
      setShowPin(true)
    }
  }

  return (
    <>
      <div className="hidden lg:flex h-14 items-center justify-between border-b border-zinc-700/50 bg-zinc-900 px-6 shrink-0">
        {/* Left: logo + meta */}
        <div className="flex items-center gap-4">
          <Image
            src="/logo.svg"
            alt="Darvis"
            width={90}
            height={24}
            className="h-5 w-auto opacity-80"
          />
          <div className="flex items-center gap-2 text-sm">
            <span className="font-mono text-zinc-500">v0.1.0</span>
            <span className="text-zinc-700">·</span>
            <span className="text-zinc-500">Aktualizováno 20. 3. 2026, 14:30</span>
          </div>
        </div>

        {/* Center: progress */}
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-sm text-zinc-400">Fáze 1 ze 3</span>
          <span className="text-sm text-zinc-600 font-mono">— MVP kalkulace</span>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-4">
          {/* Timeline */}
          <Sheet>
            <SheetTrigger className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer">
              <ListChecks className="size-4" />
              Timeline
            </SheetTrigger>
            <SheetContent side="top" className="max-h-[75vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Průběh projektu</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-6">
                <DevLog embedded />
              </div>
            </SheetContent>
          </Sheet>

          <span className="h-4 w-px bg-zinc-700" />

          {/* Admin */}
          <button
            type="button"
            onClick={handleAdminClick}
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ShieldCheck className="size-4" />
            Admin
          </button>

          <span className="h-4 w-px bg-zinc-700" />

          {/* LVZ logo */}
          <TooltipProvider delay={300}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <a
                    href="https://levouzadni.cz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-60 hover:opacity-100 transition-opacity"
                  />
                }
              >
                <Image
                  src="/lvz-logo.svg"
                  alt="Levou zadní"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={8} className="text-center">
                <div>Vyrobeno</div>
                <div>Levouzadni.cz</div>
                <div className="text-[10px] opacity-70">AI studio</div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <AdminPinModal open={showPin} onClose={() => setShowPin(false)} />
    </>
  )
}

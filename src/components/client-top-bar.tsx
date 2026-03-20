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
  const [pin, setPin] = useState("")
  const [error, setError] = useState(false)

  function handleSubmit() {
    if (pin.length < 1) return
    fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    }).then((res) => {
      if (res.ok) {
        window.location.href = "/admin/feedback"
      } else {
        setError(true)
        setPin("")
      }
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex flex-col items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl w-72">
        <Lock className="size-6 text-zinc-500" />
        <h2 className="text-base font-semibold text-zinc-200">Admin</h2>
        <Input
          type="password"
          value={pin}
          onChange={(e) => { setPin(e.target.value); setError(false) }}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); if (e.key === "Escape") onClose() }}
          placeholder="Kód"
          className="h-11 text-center text-lg tracking-widest"
          autoFocus
        />
        {error && <p className="text-sm text-red-400">Nesprávný kód</p>}
        <Button className="w-full h-10" onClick={handleSubmit} disabled={pin.length < 1}>
          Vstoupit
        </Button>
      </div>
    </div>
  )
}

export function ClientTopBar() {

  function handleAdminClick() {
    window.open("/admin/feedback", "_blank")
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
            <span className="text-zinc-500">
            {new Date().toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" })}{", "}
            {new Date().toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })}
          </span>
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

    </>
  )
}

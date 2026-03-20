"use client"

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
import { openFeedbackModal } from "@/components/feedback-button"
import { Clock, MessageCircle, ListChecks } from "lucide-react"

export function ClientTopBar() {
  return (
    <div className="hidden lg:flex h-14 items-center justify-between border-b border-zinc-800/50 bg-zinc-950 px-6 shrink-0">
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
        {/* Timeline sheet */}
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

        <span className="h-4 w-px bg-zinc-800" />

        {/* Feedback trigger */}
        <button
          type="button"
          onClick={() => openFeedbackModal()}
          className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <MessageCircle className="size-4" />
          Zpětná vazba
        </button>

        <span className="h-4 w-px bg-zinc-800" />

        {/* LVZ logo with tooltip */}
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
  )
}

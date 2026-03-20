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
import { ListChecks, ShieldCheck, FileText, Sparkles, Bug, RefreshCw } from "lucide-react"
import { RELEASE_NOTES, type ReleaseNote } from "@/lib/release-notes"


const NOTE_TYPE_CONFIG: Record<ReleaseNote["type"], { Icon: typeof Sparkles; color: string; label: string }> = {
  feature: { Icon: Sparkles, color: "text-blue-400", label: "Feature" },
  fix: { Icon: Bug, color: "text-red-400", label: "Fix" },
  change: { Icon: RefreshCw, color: "text-amber-400", label: "Change" },
}

function ReleaseNoteCard({ note }: { note: ReleaseNote }) {
  const typeConf = NOTE_TYPE_CONFIG[note.type]
  const TypeIcon = typeConf.Icon
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xs font-mono text-zinc-500">v{note.version}</span>
        <span className="text-zinc-700">·</span>
        <span className="text-xs text-zinc-500">{note.date}</span>
        <span className="text-zinc-700">·</span>
        <span className={`flex items-center gap-1 text-xs ${typeConf.color}`}>
          <TypeIcon className="size-3" />
          {typeConf.label}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-zinc-200 mb-1">{note.title}</h3>
      <p className="text-xs text-zinc-400 leading-relaxed">{note.description}</p>
    </div>
  )
}

export function ClientTopBar() {

  function handleAdminClick() {
    window.open("/admin/feedback", "_blank")
  }

  return (
    <>
      <nav aria-label="Hlavní navigace" className="hidden lg:flex h-14 items-center justify-between border-b border-zinc-700/50 bg-zinc-900 px-6 shrink-0">
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

          {/* Notes */}
          <Sheet>
            <SheetTrigger className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer">
              <FileText className="size-4" />
              Notes
            </SheetTrigger>
            <SheetContent side="top" className="max-h-[75vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Release notes</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-6">
                <div className="flex flex-col gap-3 max-w-2xl mx-auto">
                  {RELEASE_NOTES.map((note) => (
                    <ReleaseNoteCard key={note.id} note={note} />
                  ))}
                </div>
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
      </nav>

    </>
  )
}

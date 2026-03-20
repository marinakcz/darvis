"use client"

import { useSyncExternalStore } from "react"
import { ChevronRight, LogOut } from "lucide-react"
import { Surface, Group, Row, SectionHeader } from "@/components/ds"

function useIsMounted() {
  return useSyncExternalStore(() => () => {}, () => true, () => false)
}

export default function ProfilePage() {
  const mounted = useIsMounted()
  if (!mounted) return null

  return (
    <div className="flex flex-1 flex-col ios-fade-in">
      <header className="bg-surface-0 px-4 pt-4 pb-3">
        <h1 className="text-2xl font-bold tracking-tight">Profil</h1>
      </header>

      <main className="flex flex-1 flex-col gap-5 px-4 pb-4 overflow-y-auto">
        {/* User info */}
        <Surface className="p-4 flex items-center gap-3">
          <div className="flex items-center justify-center size-12 rounded-full bg-surface-2 text-text-secondary text-base font-semibold shrink-0">
            JT
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold">Jan Technik</span>
            <span className="text-sm text-text-secondary">Obchodník · Stěhování Praha</span>
          </div>
        </Surface>

        {/* Settings */}
        <SectionHeader>Nastavení</SectionHeader>
        <Surface>
          <Group>
            <div className="flex items-center justify-between px-4 py-3 min-h-[44px]">
              <span className="text-sm">Tmavý režim</span>
              <div className="relative h-[31px] w-[51px] rounded-full bg-success transition-colors">
                <div className="absolute right-[2px] top-[2px] h-[27px] w-[27px] rounded-full bg-surface-0 shadow transition-transform" />
              </div>
            </div>
            <button type="button" className="flex items-center justify-between px-4 py-3 min-h-[44px] w-full text-left hover:bg-surface-3 active:bg-surface-3 transition-colors">
              <span className="text-sm">Notifikace</span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-text-secondary">Zapnuto</span>
                <ChevronRight className="size-4 text-text-tertiary" />
              </div>
            </button>
          </Group>
        </Surface>

        {/* App info */}
        <SectionHeader>Aplikace</SectionHeader>
        <Surface>
          <Group>
            <Row label="Verze" value="v0.2.0" mono />
            <button type="button" className="flex items-center justify-between px-4 py-3 min-h-[44px] w-full text-left hover:bg-surface-3 active:bg-surface-3 transition-colors">
              <span className="text-sm">Podpora</span>
              <ChevronRight className="size-4 text-text-tertiary" />
            </button>
            <button type="button" className="flex items-center justify-between px-4 py-3 min-h-[44px] w-full text-left hover:bg-surface-3 active:bg-surface-3 transition-colors">
              <span className="text-sm">Podmínky použití</span>
              <ChevronRight className="size-4 text-text-tertiary" />
            </button>
          </Group>
        </Surface>

        {/* Logout */}
        <div className="mt-auto pt-4">
          <Surface>
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] w-full text-center text-destructive hover:bg-red-500/8 active:bg-red-500/8 transition-colors rounded-2xl"
            >
              <LogOut className="size-4" />
              <span className="text-sm font-medium">Odhlásit se</span>
            </button>
          </Surface>
        </div>
      </main>
    </div>
  )
}

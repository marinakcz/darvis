"use client"

import { useRouter } from "next/navigation"
import { LogOut, ChevronRight } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()

  function handleLogout() {
    // Clear all job drafts
    const keys = Object.keys(localStorage)
    for (const key of keys) {
      if (key.startsWith("darvis-job-")) {
        localStorage.removeItem(key)
      }
    }
    router.push("/dashboard")
  }

  return (
    <div className="flex flex-1 flex-col ios-fade-in">
      <header className="bg-background px-4 pt-4 pb-2">
        <h1 className="text-2xl font-bold tracking-tight">Profil</h1>
      </header>
      <main className="flex flex-1 flex-col gap-5 px-4 py-4">
        {/* User info */}
        <div className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-1">
          <span className="text-base font-semibold">Jan Technik</span>
          <span className="text-sm text-muted-foreground">Obchodník</span>
        </div>

        {/* Settings */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider px-4 pb-0.5">Nastavení</p>
          <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 min-h-[44px]">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm">Výchozí režim zaměření</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-muted-foreground">Rychlý</span>
                <ChevronRight className="size-4 text-muted-foreground/50" />
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 min-h-[44px]">
              <span className="text-sm">Tmavý režim</span>
              <div className="relative h-[31px] w-[51px] rounded-full bg-primary transition-colors">
                <div className="absolute right-[2px] top-[2px] h-[27px] w-[27px] rounded-full bg-background shadow transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* App info */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider px-4 pb-0.5">Aplikace</p>
          <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 min-h-[44px]">
              <span className="text-sm">Verze</span>
              <span className="text-sm text-muted-foreground">v0.1.0</span>
            </div>
            <button type="button" className="flex items-center justify-between px-4 py-3 min-h-[44px] w-full text-left hover:bg-accent active:bg-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              <span className="text-sm">Podpora</span>
              <ChevronRight className="size-4 text-muted-foreground/50" />
            </button>
            <button type="button" className="flex items-center justify-between px-4 py-3 min-h-[44px] w-full text-left hover:bg-accent active:bg-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              <span className="text-sm">Podmínky použití</span>
              <ChevronRight className="size-4 text-muted-foreground/50" />
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="mt-auto pt-4">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] w-full text-center text-destructive hover:bg-destructive/10 active:bg-destructive/10 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <LogOut className="size-4" />
              <span className="text-sm font-medium">Odhlásit se</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

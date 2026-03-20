"use client"

import { ClipboardList, Calendar, PlusCircle, User } from "lucide-react"

interface MobileTabBarProps {
  activeTab: "jobs" | "calendar" | "new" | "profile"
  onNavigate: (tab: "jobs" | "calendar" | "new" | "profile") => void
}

const TABS = [
  { id: "jobs" as const, label: "Zakázky", icon: ClipboardList },
  { id: "calendar" as const, label: "Kalendář", icon: Calendar },
  { id: "new" as const, label: "Nový", icon: PlusCircle },
  { id: "profile" as const, label: "Profil", icon: User },
]

export function MobileTabBar({ activeTab, onNavigate }: MobileTabBarProps) {
  return (
    <nav className="h-16 border-t border-border bg-background pb-4 flex items-center justify-around px-2 shrink-0">
      {TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onNavigate(tab.id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon className="size-5" />
            <span className="text-[10px] leading-tight">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

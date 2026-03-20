// SwiftUI: TabView
"use client"

import Link from "next/link"
import { ClipboardList, Calendar, User } from "lucide-react"

interface MobileTabBarProps {
  activeTab: "jobs" | "calendar" | "profile"
}

const TABS = [
  { id: "jobs" as const, label: "Zakázky", icon: ClipboardList, href: "/dashboard" },
  { id: "calendar" as const, label: "Kalendář", icon: Calendar, href: "/calendar" },
  { id: "profile" as const, label: "Profil", icon: User, href: "/profile" },
]

export function MobileTabBar({ activeTab }: MobileTabBarProps) {
  return (
    <nav className="border-t border-border bg-background/80 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] flex items-center justify-around px-2 shrink-0" style={{ minHeight: 49 }}>
      {TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon className="size-5" />
            <span className="text-[11px] leading-tight">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

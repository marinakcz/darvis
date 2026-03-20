// SwiftUI: TabView
"use client"

import Link from "next/link"
import { Home, ClipboardList, Bell, User } from "lucide-react"
import { MOCK_NOTIFICATIONS } from "@/lib/mock-data"

export type TabId = "home" | "jobs" | "notifications" | "profile"

interface MobileTabBarProps {
  activeTab: TabId
}

const TABS: { id: TabId; label: string; icon: typeof Home; href: string }[] = [
  { id: "home", label: "Přehled", icon: Home, href: "/dashboard" },
  { id: "jobs", label: "Zakázky", icon: ClipboardList, href: "/jobs" },
  { id: "notifications", label: "Zprávy", icon: Bell, href: "/notifications" },
  { id: "profile", label: "Profil", icon: User, href: "/profile" },
]

export function MobileTabBar({ activeTab }: MobileTabBarProps) {
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length

  return (
    <nav className="border-t border-border bg-surface-0/80 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] flex items-center justify-around px-2 shrink-0" style={{ minHeight: 49 }}>
      {TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        const showBadge = tab.id === "notifications" && unreadCount > 0
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-1 rounded transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              isActive ? "text-text-primary" : "text-text-tertiary"
            }`}
          >
            <div className="relative">
              <Icon className="size-5" />
              {showBadge && (
                <span className="absolute -top-1 -right-1.5 flex items-center justify-center size-4 rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className="text-[11px] leading-tight">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

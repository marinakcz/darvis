// iOS TabBarController with center action button
"use client"

import Link from "next/link"
import { LayoutDashboard, CalendarDays, ClipboardList, User, Plus } from "lucide-react"

export type TabId = "home" | "calendar" | "jobs" | "profile"

interface MobileTabBarProps {
  activeTab: TabId
  onCenterTap: () => void
}

const LEFT_TABS: { id: TabId; label: string; icon: typeof LayoutDashboard; href: string }[] = [
  { id: "home", label: "Přehled", icon: LayoutDashboard, href: "/dashboard" },
  { id: "calendar", label: "Kalendář", icon: CalendarDays, href: "/calendar" },
]

const RIGHT_TABS: { id: TabId; label: string; icon: typeof LayoutDashboard; href: string }[] = [
  { id: "jobs", label: "Zakázky", icon: ClipboardList, href: "/jobs" },
  { id: "profile", label: "Profil", icon: User, href: "/profile" },
]

export function MobileTabBar({ activeTab, onCenterTap }: MobileTabBarProps) {
  return (
    <nav className="border-t border-border bg-surface-0/80 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] flex items-center justify-around px-2 shrink-0 relative" style={{ minHeight: 49 }}>
      {LEFT_TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <Link key={tab.id} href={tab.href}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-1 rounded transition-colors ${isActive ? "text-text-primary" : "text-text-tertiary"}`}>
            <Icon className="size-5" />
            <span className="text-[11px] leading-tight">{tab.label}</span>
          </Link>
        )
      })}

      {/* Center action button */}
      <button type="button" onClick={onCenterTap} aria-label="Nová akce"
        className="flex items-center justify-center size-12 -mt-5 rounded-2xl bg-success text-success-foreground shadow-lg shadow-success/25 hover:bg-success/90 active:scale-95 transition-all">
        <Plus className="size-6" />
      </button>

      {RIGHT_TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <Link key={tab.id} href={tab.href}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-1 rounded transition-colors ${isActive ? "text-text-primary" : "text-text-tertiary"}`}>
            <Icon className="size-5" />
            <span className="text-[11px] leading-tight">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

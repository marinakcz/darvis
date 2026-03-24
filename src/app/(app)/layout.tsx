"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { MobileTabBar } from "@/components/mobile-tab-bar"
import { CommandCenter } from "@/components/command-center"
import { QuickJobSheet } from "@/components/quick-job-sheet"
import type { TabId } from "@/components/mobile-tab-bar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [commandCenterOpen, setCommandCenterOpen] = useState(false)
  const [quickJobOpen, setQuickJobOpen] = useState(false)

  // Hide tab bar inside the survey wizard and offer page
  const hideTabBar = /\/jobs\/[^/]+\/(survey|offer)/.test(pathname)

  // Detect active tab
  let activeTab: TabId = "home"
  if (pathname.startsWith("/profile")) activeTab = "profile"
  else if (pathname.startsWith("/calendar")) activeTab = "calendar"
  else if (pathname.startsWith("/jobs")) activeTab = "jobs"

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col overflow-y-auto">
        {children}
      </div>
      {!hideTabBar && (
        <MobileTabBar activeTab={activeTab} onCenterTap={() => setCommandCenterOpen(true)} />
      )}
      <CommandCenter
        open={commandCenterOpen}
        onClose={() => setCommandCenterOpen(false)}
        onQuickJob={() => {
          setCommandCenterOpen(false)
          setQuickJobOpen(true)
        }}
      />
      <QuickJobSheet
        open={quickJobOpen}
        onClose={() => setQuickJobOpen(false)}
        onCreated={(id) => {
          setQuickJobOpen(false)
          router.push(`/jobs/${id}`)
        }}
      />
    </div>
  )
}

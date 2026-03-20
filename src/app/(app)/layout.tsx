"use client"

import { usePathname } from "next/navigation"
import { PhoneFrame } from "@/components/phone-frame"
import { MobileTabBar } from "@/components/mobile-tab-bar"
import type { TabId } from "@/components/mobile-tab-bar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Hide tab bar inside the survey wizard and offer page
  const hideTabBar = /\/jobs\/[^/]+\/(survey|offer)/.test(pathname)

  // Detect active tab
  let activeTab: TabId = "home"
  if (pathname.startsWith("/notifications")) activeTab = "notifications"
  else if (pathname.startsWith("/profile")) activeTab = "profile"
  else if (pathname.startsWith("/jobs")) activeTab = "jobs"

  const tabBar = hideTabBar ? null : (
    <MobileTabBar activeTab={activeTab} />
  )

  return <PhoneFrame tabBar={tabBar}>{children}</PhoneFrame>
}

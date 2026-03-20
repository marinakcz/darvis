"use client"

import { usePathname } from "next/navigation"
import { PhoneFrame } from "@/components/phone-frame"
import { MobileTabBar } from "@/components/mobile-tab-bar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Hide tab bar inside the survey wizard
  const isSurvey = /\/jobs\/[^/]+\/survey/.test(pathname)

  const activeTab: "jobs" | "calendar" | "profile" =
    pathname.startsWith("/calendar") ? "calendar" :
    pathname.startsWith("/profile") ? "profile" :
    "jobs"

  const tabBar = isSurvey ? null : (
    <MobileTabBar activeTab={activeTab} />
  )

  return <PhoneFrame tabBar={tabBar}>{children}</PhoneFrame>
}

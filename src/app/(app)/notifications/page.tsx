"use client"

import { useRouter } from "next/navigation"
import { useCallback, useSyncExternalStore } from "react"
import { ChevronRight, CheckCircle2, XCircle, MessageSquare, RefreshCw, MessageCircle } from "lucide-react"
import { SectionHeader } from "@/components/ds"
import { MOCK_NOTIFICATIONS } from "@/lib/mock-data"
import type { MockNotification } from "@/lib/mock-data"

function useIsMounted() {
  return useSyncExternalStore(() => () => {}, () => true, () => false)
}

const TYPE_ICON: Record<MockNotification["type"], typeof CheckCircle2> = {
  approval: CheckCircle2, rejection: XCircle, message: MessageSquare, change: RefreshCw, comment: MessageCircle,
}
const TYPE_COLOR: Record<MockNotification["type"], string> = {
  approval: "text-green-400", rejection: "text-red-400", message: "text-blue-400", change: "text-amber-400", comment: "text-purple-400",
}

export default function NotificationsPage() {
  const mounted = useIsMounted()
  const router = useRouter()

  const openNotification = useCallback((n: MockNotification) => {
    if (n.jobId) router.push(`/jobs/${n.jobId}`)
  }, [router])

  if (!mounted) return null

  const unread = MOCK_NOTIFICATIONS.filter((n) => !n.read)
  const read = MOCK_NOTIFICATIONS.filter((n) => n.read)

  return (
    <div className="flex flex-1 flex-col ios-fade-in">
      <header className="bg-surface-0 px-4 pt-4 pb-3">
        <h1 className="text-2xl font-bold tracking-tight">Zprávy</h1>
        <p className="text-sm text-text-tertiary mt-0.5">
          {unread.length > 0 ? `${unread.length} nepřečtených` : "Vše přečteno"}
        </p>
      </header>

      <main className="flex flex-1 flex-col gap-4 px-4 pb-4 overflow-y-auto">
        {unread.length > 0 && (
          <>
            <SectionHeader>Nové</SectionHeader>
            <div className="rounded-2xl bg-surface-1 overflow-hidden divide-y divide-border">
              {unread.map((n) => <NotificationRow key={n.id} notification={n} onClick={() => openNotification(n)} />)}
            </div>
          </>
        )}
        {read.length > 0 && (
          <>
            <SectionHeader>Dřívější</SectionHeader>
            <div className="rounded-2xl bg-surface-1 overflow-hidden divide-y divide-border">
              {read.map((n) => <NotificationRow key={n.id} notification={n} onClick={() => openNotification(n)} />)}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function NotificationRow({ notification, onClick }: { notification: MockNotification; onClick: () => void }) {
  const Icon = TYPE_ICON[notification.type]
  const color = TYPE_COLOR[notification.type]
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 px-4 py-3 min-h-[44px] w-full text-left transition-colors hover:bg-surface-2 active:bg-surface-2 ${
        !notification.read ? "bg-surface-2/50" : ""
      }`}
    >
      <div className="pt-0.5 shrink-0"><Icon className={`size-5 ${color}`} /></div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className={`text-sm ${notification.read ? "" : "font-semibold"} line-clamp-1`}>{notification.title}</span>
          {!notification.read && <span className="size-2 rounded-full bg-red-500 shrink-0 mt-1.5" />}
        </div>
        <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{notification.body}</p>
        <span className="text-[10px] text-text-tertiary mt-1 block">{notification.time}</span>
      </div>
      {notification.jobId && <ChevronRight className="size-4 text-text-tertiary shrink-0 mt-1" />}
    </button>
  )
}

import { MapPin, Clock } from "lucide-react"
import { CALENDAR_ENTRIES } from "@/lib/mock-data"

export default function CalendarPage() {
  return (
    <div className="flex flex-1 flex-col ios-fade-in">
      <header className="bg-background px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Kalendář</h1>
          <span className="text-sm text-muted-foreground">Březen 2026</span>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-3 px-4 py-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider px-1">Nadcházející</p>
        <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
          {CALENDAR_ENTRIES.map((entry) => {
            const dateFormatted = new Date(entry.date).toLocaleDateString("cs-CZ", {
              weekday: "short", day: "numeric", month: "numeric",
            })
            const statusBorderColor = entry.statusColor === "text-blue-400" ? "border-l-blue-400" : entry.statusColor === "text-green-400" ? "border-l-green-400" : "border-l-yellow-400"
            return (
              <div
                key={entry.id}
                className={`p-3 flex flex-col gap-1.5 border-l-[3px] ${statusBorderColor}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="size-3.5 text-muted-foreground" />
                    <span className="font-medium">{dateFormatted}</span>
                  </div>
                  <span className={`text-xs font-medium ${entry.statusColor}`}>{entry.status}</span>
                </div>
                <span className="text-sm font-medium">{entry.client}</span>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  <span>{entry.address}</span>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

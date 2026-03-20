import { list } from "@vercel/blob"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  want: { label: "Chci tohle", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  change: { label: "Změnit", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  confusing: { label: "Nechápu", color: "bg-red-500/10 text-red-400 border-red-500/20" },
  missing: { label: "Chybí mi", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  love: { label: "Líbí se", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
}

interface FeedbackEntry {
  id: string
  type: string
  message: string
  page: string
  author?: string | null
  createdAt: string
}

async function getFeedback(): Promise<FeedbackEntry[]> {
  try {
    const entries: FeedbackEntry[] = []
    let cursor: string | undefined

    do {
      const result = await list({ prefix: "feedback/", limit: 100, cursor })
      for (const blob of result.blobs) {
        try {
          const res = await fetch(blob.url, {
            cache: "no-store",
            headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
          })
          entries.push(await res.json())
        } catch {
          // skip
        }
      }
      cursor = result.hasMore ? result.cursor : undefined
    } while (cursor)

    return entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch {
    return []
  }
}

export default async function AdminFeedbackPage() {
  const entries = await getFeedback()

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex items-center justify-between pb-6">
          <div>
            <h1 className="text-xl font-bold">Zpětná vazba</h1>
            <p className="text-sm text-zinc-500">{entries.length} záznamů</p>
          </div>
          <a href="/survey?step=0" className="text-sm text-zinc-500 hover:text-zinc-300">
            ← Zpět na demo
          </a>
        </div>

        {entries.length === 0 ? (
          <div className="rounded-lg border border-zinc-800 p-8 text-center text-zinc-500">
            Zatím žádná zpětná vazba.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map((entry) => {
              const typeConfig = TYPE_LABELS[entry.type] ?? { label: entry.type, color: "bg-zinc-800 text-zinc-400" }
              const date = new Date(entry.createdAt)
              return (
                <div key={entry.id} className="rounded-lg border border-zinc-800 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={typeConfig.color}>
                        {typeConfig.label}
                      </Badge>
                      {entry.author && (
                        <span className="text-xs text-zinc-500">{entry.author}</span>
                      )}
                    </div>
                    <span className="text-xs text-zinc-600 font-mono shrink-0">
                      {date.toLocaleDateString("cs-CZ")} {date.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed">{entry.message}</p>
                  {entry.page && (
                    <p className="mt-1 text-xs text-zinc-600 font-mono">{entry.page}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

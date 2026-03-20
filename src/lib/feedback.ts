export type FeedbackType = "want" | "change" | "confusing" | "missing" | "love"

export interface FeedbackEntry {
  id: string
  kind: "general" | "pin"
  message: string
  type: FeedbackType | null
  page: string
  x: number | null
  y: number | null
  scrollY: number | null
  contentHeight: number | null
  author: string | null
  status: "new" | "read" | "in-progress" | "done"
  note: string
  resolution: string
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
}

/** Public-facing entry (admin fields stripped) */
export type PublicFeedbackEntry = Omit<FeedbackEntry, "note" | "resolution" | "status">

export const FEEDBACK_TYPES: Record<FeedbackType, { label: string; description: string; placeholder: string }> = {
  want: { label: "Chci tohle", description: "Funkce nebo chování, které potřebuji", placeholder: "Popište co byste chtěli, aby aplikace uměla…" },
  change: { label: "Změnit", description: "Něco bych udělal jinak", placeholder: "Co byste změnili a jak by to mělo fungovat…" },
  confusing: { label: "Nechápu", description: "Něco nedává smysl", placeholder: "Co vám přišlo matoucí nebo neintuitivní…" },
  missing: { label: "Chybí mi", description: "Chybí položka, místnost, funkce", placeholder: "Co v aplikaci postrádáte…" },
  love: { label: "Líbí se", description: "Tohle je super, zachovejte", placeholder: "Co se vám líbí a chcete zachovat…" },
}

/** Submit general feedback (fire-and-forget) */
export function submitFeedback(entry: {
  type: FeedbackType
  message: string
  page: string
  author?: string
}): void {
  fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind: "general",
      type: entry.type,
      message: entry.message,
      page: entry.page,
      author: entry.author || null,
    }),
  }).catch(() => {
    // offline — silent fail
  })
}

/** Submit pin comment (fire-and-forget, returns promise for optimistic update) */
export function submitPin(pin: {
  message: string
  page: string
  x: number
  y: number
  scrollY: number
  contentHeight: number
  author?: string
}): Promise<FeedbackEntry | null> {
  return fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind: "pin",
      message: pin.message,
      page: pin.page,
      x: pin.x,
      y: pin.y,
      scrollY: pin.scrollY,
      contentHeight: pin.contentHeight,
      author: pin.author || null,
    }),
  })
    .then((r) => r.json())
    .then((data) => (data.entry as FeedbackEntry) ?? null)
    .catch(() => null)
}

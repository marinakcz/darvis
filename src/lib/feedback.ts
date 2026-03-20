export type FeedbackType = "want" | "change" | "confusing" | "missing" | "love"

export interface FeedbackEntry {
  id: string
  type: FeedbackType
  message: string
  page: string
  createdAt: string
  author?: string
}

export const FEEDBACK_TYPES: Record<FeedbackType, { label: string; description: string; placeholder: string }> = {
  want: { label: "Chci tohle", description: "Funkce nebo chování, které potřebuji", placeholder: "Popište co byste chtěli, aby aplikace uměla…" },
  change: { label: "Změnit", description: "Něco bych udělal jinak", placeholder: "Co byste změnili a jak by to mělo fungovat…" },
  confusing: { label: "Nechápu", description: "Něco nedává smysl", placeholder: "Co vám přišlo matoucí nebo neintuitivní…" },
  missing: { label: "Chybí mi", description: "Chybí položka, místnost, funkce", placeholder: "Co v aplikaci postrádáte…" },
  love: { label: "Líbí se", description: "Tohle je super, zachovejte", placeholder: "Co se vám líbí a chcete zachovat…" },
}

const STORAGE_KEY = "darvis-feedback"

export function saveFeedback(entry: Omit<FeedbackEntry, "id" | "createdAt">): FeedbackEntry {
  const full: FeedbackEntry = {
    ...entry,
    id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  }
  const existing = loadFeedback()
  existing.unshift(full)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
  } catch {
    // ignore
  }
  return full
}

/** Save locally + send to server (fire-and-forget) */
export function submitFeedback(entry: Omit<FeedbackEntry, "id" | "createdAt">): FeedbackEntry {
  const saved = saveFeedback(entry)
  fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  }).catch(() => {
    // offline fallback — localStorage already has it
  })
  return saved
}

export function loadFeedback(): FeedbackEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) return JSON.parse(data)
  } catch {
    // ignore
  }
  return []
}

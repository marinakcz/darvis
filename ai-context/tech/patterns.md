# Darvis — Code Patterns

Slot-filling templates extracted from actual pages. Replace `// SLOT: ...` with your content.

## Mobile Page with DS Components

```tsx
"use client"

import { useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Loader2 } from "lucide-react"
import { Surface, Group, Row, ActionButton, SectionHeader, Alert } from "@/components/ds"

function useIsMounted() {
  return useSyncExternalStore(() => () => {}, () => true, () => false)
}

export default function MyPage() {
  const mounted = useIsMounted()
  const router = useRouter()
  // SLOT: state declarations
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)

  // Fetch after mount
  if (mounted && !loaded) {
    setLoaded(true)
    fetch("/api/my-endpoint")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  if (!mounted || loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-text-tertiary" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col ios-slide-in">
      {/* Sticky header with back button */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface-0/80 backdrop-blur-xl px-4 py-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Zpět"
            className="flex items-center justify-center size-9 -ml-1 rounded-lg text-text-secondary hover:bg-surface-2 active:bg-surface-2 transition-colors"
          >
            <ChevronLeft className="size-5" />
          </button>
          <span className="text-sm font-semibold truncate">
            {/* SLOT: page title */}
          </span>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 px-4 py-4 pb-24">
        {/* SLOT: section header */}
        <SectionHeader>Sekce</SectionHeader>

        {/* SLOT: Surface card */}
        <Surface className="px-4 py-4">
          {/* SLOT: card content */}
        </Surface>

        {/* SLOT: Group with key-value rows */}
        <Group>
          <Row label="Klíč" value="Hodnota" />
          <Row label="Číslo" value="42" mono />
        </Group>

        {/* SLOT: inline alert */}
        <Alert variant="warning" title="Upozornění">
          {/* SLOT: alert message */}
        </Alert>
      </main>

      {/* Sticky CTA at bottom */}
      <div className="sticky bottom-0 z-40 border-t border-border bg-surface-0/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
        <div className="px-4 py-3">
          <ActionButton onClick={() => { /* SLOT: action */ }}>
            {/* SLOT: button label */}
          </ActionButton>
        </div>
      </div>
    </div>
  )
}
```

## Client-First with Hydration Guard

```tsx
"use client"

import { useState, useSyncExternalStore } from "react"
import { Loader2 } from "lucide-react"

function useIsMounted() {
  return useSyncExternalStore(() => () => {}, () => true, () => false)
}

// SLOT: TypeScript interface for your data
interface MyData {
  id: string
  // SLOT: fields
}

export default function MyClientPage() {
  const mounted = useIsMounted()
  const [data, setData] = useState<MyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)

  if (mounted && !loaded) {
    setLoaded(true)
    // SLOT: fetch call
    fetch("/api/endpoint")
      .then((r) => {
        if (!r.ok) throw new Error("not found")
        return r.json()
      })
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  // Loader while SSR or fetching
  if (!mounted || loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-text-tertiary" />
      </div>
    )
  }

  // Not found state
  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-text-secondary">Nenalezeno.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col ios-fade-in">
      {/* SLOT: page content using data */}
    </div>
  )
}
```

## Drizzle Query Pattern (API Route)

```ts
import { db, schema } from "@/lib/db"
import { logJobEvent } from "@/lib/db/events"
import { eq, desc } from "drizzle-orm"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

/** GET /api/resource — list with join */
export async function GET() {
  const rows = await db
    .select({
      // SLOT: select fields
      id: schema.jobs.id,
      status: schema.jobs.status,
      customerName: schema.customers.name,
    })
    .from(schema.jobs)
    // SLOT: optional join
    .leftJoin(schema.customers, eq(schema.jobs.customerId, schema.customers.id))
    // SLOT: optional where
    .orderBy(desc(schema.jobs.createdAt))

  return Response.json(rows)
}

/** POST /api/resource — insert and return */
export async function POST(request: NextRequest) {
  const body = await request.json()

  const [created] = await db
    .insert(schema.jobs)
    .values({
      // SLOT: map body fields to schema columns
    })
    .returning({ id: schema.jobs.id })

  // SLOT: optional event logging
  await logJobEvent(created.id, "job_created", { source: "api" })

  return Response.json({ id: created.id }, { status: 201 })
}

/** PATCH /api/resource/[id] — update */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  await db
    .update(schema.jobs)
    .set({
      // SLOT: fields to update
      updatedAt: new Date(),
    })
    .where(eq(schema.jobs.id, id))

  return Response.json({ ok: true })
}
```

## Status Color Mapping

```ts
const STATUS_CONFIG: Record<string, { label: string; color: string; borderColor: string }> = {
  draft:      { label: "Koncept",   color: "text-text-tertiary",      borderColor: "border-l-zinc-400" },
  survey:     { label: "Zaměření",  color: "text-status-survey",      borderColor: "border-l-status-survey" },
  offer:      { label: "Nabídka",   color: "text-status-approval",    borderColor: "border-l-status-approval" },
  approved:   { label: "Schváleno", color: "text-status-execution",   borderColor: "border-l-status-execution" },
  execution:  { label: "Realizace", color: "text-status-execution",   borderColor: "border-l-status-execution" },
  invoicing:  { label: "Fakturace", color: "text-status-invoicing",   borderColor: "border-l-status-invoicing" },
  done:       { label: "Hotovo",    color: "text-text-tertiary",      borderColor: "border-l-zinc-400" },
}
```

## Section Header Pattern

```tsx
<div className="flex items-center justify-between mb-3">
  <span className="text-[10px] text-text-tertiary tracking-widest uppercase">
    {/* SLOT: section name */}
  </span>
  <button type="button" onClick={() => router.push("...")}
    className="text-[11px] text-success flex items-center gap-0.5 hover:text-success/80 transition-colors">
    vše <ChevronRight className="size-3" />
  </button>
</div>
```

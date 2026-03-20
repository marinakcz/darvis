import { put, list, del } from "@vercel/blob"
import { isAdmin } from "@/lib/admin-auth"
import type { NextRequest } from "next/server"
import type { FeedbackEntry } from "@/lib/feedback"

export const dynamic = "force-dynamic"

const TOKEN = () => process.env.BLOB_READ_WRITE_TOKEN!
const AUTH_HEADER = () => ({ Authorization: `Bearer ${TOKEN()}` })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { kind, message, type, page, x, y, scrollY, contentHeight, author } = body

    if (!kind || !message || message.length < 1) {
      return Response.json({ error: "Invalid feedback" }, { status: 400 })
    }

    if (kind !== "general" && kind !== "pin") {
      return Response.json({ error: "Invalid kind" }, { status: 400 })
    }

    const now = new Date().toISOString()
    const id = `fb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const entry: FeedbackEntry = {
      id,
      kind,
      message: message.slice(0, 2000),
      type: kind === "general" ? (type || null) : null,
      page: page || "",
      x: kind === "pin" ? Number(x) : null,
      y: kind === "pin" ? Number(y) : null,
      scrollY: kind === "pin" ? Number(scrollY ?? 0) : null,
      contentHeight: kind === "pin" ? Number(contentHeight ?? 0) : null,
      author: author || null,
      status: "new",
      note: "",
      resolution: "",
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
    }

    await put(`feedback/${id}.json`, JSON.stringify(entry), {
      contentType: "application/json",
      access: "private",
      addRandomSuffix: false,
    })

    return Response.json({ ok: true, id, entry })
  } catch (error) {
    console.error("Feedback POST error:", error)
    return Response.json({ error: "Failed to save" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = isAdmin(request)
    const pageFilter = request.nextUrl.searchParams.get("page")

    const entries = await fetchAllFeedback()

    const filtered = pageFilter
      ? entries.filter((e) => e.page === pageFilter)
      : entries

    if (admin) {
      return Response.json(filtered)
    }

    // Strip admin-only fields for public
    const publicEntries = filtered.map(({ note, resolution, status, ...rest }) => rest)
    return Response.json(publicEntries)
  } catch (error) {
    console.error("Feedback GET error:", error)
    return Response.json([], { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Admin only
    if (!isAdmin(request)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, status, note, resolution } = await request.json()
    if (!id) return Response.json({ error: "Missing id" }, { status: 400 })

    const entries = await fetchAllFeedback()
    const entry = entries.find((e) => e.id === id)
    if (!entry) return Response.json({ error: "Not found" }, { status: 404 })

    if (status) entry.status = status
    if (note !== undefined) entry.note = note
    if (resolution !== undefined) entry.resolution = resolution
    entry.updatedAt = new Date().toISOString()

    if (status === "done" && !entry.resolvedAt) {
      entry.resolvedAt = entry.updatedAt
    }

    await put(`feedback/${id}.json`, JSON.stringify(entry), {
      contentType: "application/json",
      access: "private",
      addRandomSuffix: false,
    })

    return Response.json({ ok: true })
  } catch (error) {
    console.error("Feedback PATCH error:", error)
    return Response.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await request.json()
    if (!id) return Response.json({ error: "Missing id" }, { status: 400 })

    await del(`feedback/${id}.json`)

    return Response.json({ ok: true })
  } catch (error) {
    console.error("Feedback DELETE error:", error)
    return Response.json({ error: "Failed to delete" }, { status: 500 })
  }
}

async function fetchAllFeedback(): Promise<FeedbackEntry[]> {
  const entries: FeedbackEntry[] = []
  let cursor: string | undefined

  do {
    const result = await list({ prefix: "feedback/", limit: 100, cursor })
    for (const blob of result.blobs) {
      try {
        const res = await fetch(blob.url, { headers: AUTH_HEADER() })
        const data = await res.json()
        entries.push(data as FeedbackEntry)
      } catch { /* skip */ }
    }
    cursor = result.hasMore ? result.cursor : undefined
  } while (cursor)

  entries.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  return entries
}

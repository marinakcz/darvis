import { put, list } from "@vercel/blob"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const TOKEN = () => process.env.BLOB_READ_WRITE_TOKEN!
const AUTH_HEADER = () => ({ Authorization: `Bearer ${TOKEN()}` })

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, message, page, author } = body

    if (!type || !message || message.length < 3) {
      return NextResponse.json({ error: "Invalid feedback" }, { status: 400 })
    }

    const id = `fb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const entry = {
      id,
      type,
      message: message.slice(0, 2000),
      page: page || "",
      author: author || null,
      status: "new",
      note: "",
      createdAt: new Date().toISOString(),
    }

    await put(`feedback/${id}.json`, JSON.stringify(entry), {
      contentType: "application/json",
      access: "private",
      addRandomSuffix: false,
    })

    return NextResponse.json({ ok: true, id })
  } catch (error) {
    console.error("Feedback POST error:", error)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const entries = await fetchAllFeedback()
    return NextResponse.json(entries)
  } catch (error) {
    console.error("Feedback GET error:", error)
    return NextResponse.json([], { status: 500 })
  }
}

/** PATCH — update status/note on a feedback entry */
export async function PATCH(request: Request) {
  try {
    const { id, status, note } = await request.json()
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

    // Fetch existing
    const entries = await fetchAllFeedback()
    const entry = entries.find((e) => e.id === id)
    if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // Update fields
    if (status) entry.status = status
    if (note !== undefined) entry.note = note

    // Re-save
    await put(`feedback/${id}.json`, JSON.stringify(entry), {
      contentType: "application/json",
      access: "private",
      addRandomSuffix: false,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Feedback PATCH error:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

async function fetchAllFeedback() {
  const entries: Record<string, unknown>[] = []
  let cursor: string | undefined

  do {
    const result = await list({ prefix: "feedback/", limit: 100, cursor })
    for (const blob of result.blobs) {
      try {
        const res = await fetch(blob.url, { headers: AUTH_HEADER() })
        const data = await res.json()
        entries.push(data)
      } catch { /* skip */ }
    }
    cursor = result.hasMore ? result.cursor : undefined
  } while (cursor)

  entries.sort((a, b) =>
    new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()
  )
  return entries
}

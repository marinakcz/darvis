import { put, list } from "@vercel/blob"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

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
    const entries = []
    let cursor: string | undefined

    do {
      const result = await list({
        prefix: "feedback/",
        limit: 100,
        cursor,
      })

      for (const blob of result.blobs) {
        try {
          const res = await fetch(blob.url, {
            headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
          })
          const data = await res.json()
          entries.push(data)
        } catch {
          // skip broken entries
        }
      }

      cursor = result.hasMore ? result.cursor : undefined
    } while (cursor)

    entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(entries)
  } catch (error) {
    console.error("Feedback GET error:", error)
    return NextResponse.json([], { status: 500 })
  }
}

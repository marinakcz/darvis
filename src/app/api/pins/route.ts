import { put, list } from "@vercel/blob"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const TOKEN = () => process.env.BLOB_READ_WRITE_TOKEN!
const AUTH = () => ({ Authorization: `Bearer ${TOKEN()}` })

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { x, y, comment, page, author } = body

    if (!comment || comment.length < 1) {
      return NextResponse.json({ error: "Empty comment" }, { status: 400 })
    }

    const id = `pin-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const entry = {
      id,
      x: Number(x),
      y: Number(y),
      comment: comment.slice(0, 2000),
      page: page || "",
      author: author || null,
      resolved: false,
      resolution: "",
      createdAt: new Date().toISOString(),
    }

    await put(`pins/${id}.json`, JSON.stringify(entry), {
      contentType: "application/json",
      access: "private",
      addRandomSuffix: false,
    })

    return NextResponse.json({ ok: true, ...entry })
  } catch (error) {
    console.error("Pin POST error:", error)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const pageFilter = searchParams.get("page")

    const entries: Record<string, unknown>[] = []
    let cursor: string | undefined

    do {
      const result = await list({ prefix: "pins/", limit: 100, cursor })
      for (const blob of result.blobs) {
        try {
          const res = await fetch(blob.url, { headers: AUTH() })
          const data = await res.json()
          if (!pageFilter || data.page === pageFilter) {
            entries.push(data)
          }
        } catch { /* skip */ }
      }
      cursor = result.hasMore ? result.cursor : undefined
    } while (cursor)

    return NextResponse.json(entries)
  } catch (error) {
    console.error("Pin GET error:", error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, resolved, resolution } = await request.json()
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

    // Find and update
    const result = await list({ prefix: "pins/" })
    for (const blob of result.blobs) {
      if (blob.pathname === `pins/${id}.json`) {
        const res = await fetch(blob.url, { headers: AUTH() })
        const data = await res.json()
        if (resolved !== undefined) data.resolved = resolved
        if (resolution !== undefined) data.resolution = resolution
        await put(`pins/${id}.json`, JSON.stringify(data), {
          contentType: "application/json",
          access: "private",
          addRandomSuffix: false,
        })
        return NextResponse.json({ ok: true })
      }
    }
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  } catch (error) {
    console.error("Pin PATCH error:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

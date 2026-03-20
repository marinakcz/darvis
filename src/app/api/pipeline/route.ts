import { put, list } from "@vercel/blob"
import { isAdmin } from "@/lib/admin-auth"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

const PIPELINE_KEY = "pipeline/data.json"
const NOTES_KEY = "pipeline/notes.json"
const TOKEN = () => process.env.BLOB_READ_WRITE_TOKEN!
const AUTH = () => ({ Authorization: `Bearer ${TOKEN()}` })

async function getBlob(key: string): Promise<unknown | null> {
  try {
    const result = await list({ prefix: key.replace(/[^/]+$/, ""), limit: 10 })
    const blob = result.blobs.find((b) => b.pathname === key)
    if (!blob) return null
    const res = await fetch(blob.url, { headers: AUTH() })
    return res.json()
  } catch {
    return null
  }
}

async function putBlob(key: string, data: unknown) {
  await put(key, JSON.stringify(data), {
    contentType: "application/json",
    access: "private",
    addRandomSuffix: false,
  })
}

/** GET — returns pipeline + notes (public) */
export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") ?? "all"

  if (type === "pipeline" || type === "all") {
    const pipeline = await getBlob(PIPELINE_KEY)
    if (type === "pipeline") return Response.json(pipeline ?? [])
    const notes = await getBlob(NOTES_KEY)
    return Response.json({ pipeline: pipeline ?? [], notes: notes ?? [] })
  }

  if (type === "notes") {
    const notes = await getBlob(NOTES_KEY)
    return Response.json(notes ?? [])
  }

  return Response.json({ error: "Invalid type" }, { status: 400 })
}

/** PUT — admin only, updates pipeline or notes */
export async function PUT(request: NextRequest) {
  if (!isAdmin(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { type, data } = await request.json()

  if (type === "pipeline") {
    await putBlob(PIPELINE_KEY, data)
    return Response.json({ ok: true })
  }

  if (type === "notes") {
    await putBlob(NOTES_KEY, data)
    return Response.json({ ok: true })
  }

  return Response.json({ error: "Invalid type" }, { status: 400 })
}

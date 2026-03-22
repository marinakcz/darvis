/**
 * Přidá release note o startu Bloku 1.
 * Spustit: node scripts/add-release-note.mjs
 */
import { put, list } from "@vercel/blob"

const NOTES_KEY = "pipeline/notes.json"

async function getBlob(key) {
  const result = await list({ prefix: key.replace(/[^/]+$/, ""), limit: 10 })
  const blob = result.blobs.find((b) => b.pathname === key)
  if (!blob) return null
  const res = await fetch(blob.url, {
    headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
  })
  return res.json()
}

async function putBlob(key, data) {
  await put(key, JSON.stringify(data, null, 2), {
    contentType: "application/json",
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
  })
}

async function main() {
  const current = await getBlob(NOTES_KEY)
  const existing = Array.isArray(current) ? current : []

  const newNote = {
    id: `rn-${Date.now()}`,
    version: "0.2.0",
    date: "22. 3. 2026",
    title: "Blok 1 — start databázové vrstvy",
    description: "Začínáme Blok 1: reálná databáze (Neon Postgres), Drizzle ORM, schéma pro zakázky, klienty, nabídky a event log. Konec mock dat, začátek produkčního systému.",
    type: "feature",
  }

  const updated = [newNote, ...existing]
  await putBlob(NOTES_KEY, updated)
  console.log("✅ Release note přidána.")
}

main().catch((err) => {
  console.error("❌ Chyba:", err)
  process.exit(1)
})

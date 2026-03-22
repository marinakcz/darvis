/**
 * Přidá Blok 1 fáze do pipeline v Vercel Blob.
 * Spustit: node scripts/update-pipeline.mjs
 */
import { put, list } from "@vercel/blob"

const PIPELINE_KEY = "pipeline/data.json"

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

// Nové fáze Bloku 1
const BLOK1_PHASES = [
  {
    version: "0.2.0",
    date: "2026-03",
    status: "in-progress",
    title: "Databáze a schéma",
    summary: "Neon Postgres + Drizzle ORM — fundament pro reálná data",
    items: [
      { text: "Neon Postgres přes Vercel Marketplace", description: "Integrace, env vars, connection string" },
      { text: "Drizzle ORM setup", description: "Schema, migrace, DB klient" },
      { text: "Tabulky: customers, jobs, job_rooms, job_items, offers, job_events", description: "Konkrétní relační model místo mock dat" },
    ],
  },
  {
    version: "0.2.1",
    date: "2026-03",
    status: "ready",
    title: "API a wizard → DB",
    summary: "CRUD zakázek, wizard ukládá do DB místo localStorage",
    items: [
      { text: "POST/GET /api/jobs — CRUD zakázek", description: "Vytvořit, seznam, detail zakázky" },
      { text: "PUT /api/jobs/[id]/survey — uložit zaměření", description: "Nahradí localStorage persistence" },
      { text: "Wizard napojit na API", description: "Frontend volá API místo localStorage" },
    ],
  },
  {
    version: "0.2.2",
    date: "2026-04",
    status: "ready",
    title: "Nabídka z DB + sdílení",
    summary: "Vygenerovaná nabídka s unikátním odkazem pro klienta",
    items: [
      { text: "POST /api/jobs/[id]/offer — generování nabídky", description: "Calculator + uložení do DB s tokenem" },
      { text: "Veřejná nabídka /offer/[token]", description: "Klient vidí nabídku bez přihlášení" },
      { text: "PDF export nabídky", description: "Stažitelný PDF z odkazu nabídky" },
    ],
  },
  {
    version: "0.2.3",
    date: "2026-04",
    status: "ready",
    title: "Dashboard z reálných dat",
    summary: "Dashboard a job list napojený na DB, event log, cleanup mock dat",
    items: [
      { text: "Dashboard a /jobs z DB", description: "Reálná data místo mock-data.ts" },
      { text: "Event log (job_events)", description: "Append-only audit trail — základ pro timeline a AI" },
      { text: "Cleanup mock dat", description: "Odstranit mock závislosti, zachovat katalog" },
    ],
  },
]

async function main() {
  console.log("📦 Načítám aktuální pipeline...")
  const current = await getBlob(PIPELINE_KEY)
  const existing = Array.isArray(current) ? current : []

  console.log(`   Existující fáze: ${existing.length}`)

  // Přidej nové fáze (nesmažeme staré)
  const existingVersions = new Set(existing.map((p) => p.version))
  const newPhases = BLOK1_PHASES.filter((p) => !existingVersions.has(p.version))

  if (newPhases.length === 0) {
    console.log("✅ Všechny Blok 1 fáze už jsou v pipeline.")
    return
  }

  const updated = [...existing, ...newPhases]
  console.log(`   Přidávám ${newPhases.length} nových fází...`)

  await putBlob(PIPELINE_KEY, updated)
  console.log(`✅ Pipeline aktualizována — celkem ${updated.length} fází.`)
}

main().catch((err) => {
  console.error("❌ Chyba:", err)
  process.exit(1)
})

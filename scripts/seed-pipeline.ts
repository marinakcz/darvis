// Run with: npx tsx scripts/seed-pipeline.ts
// Seeds pipeline and release notes into Vercel Blob

import { put } from "@vercel/blob"

const PIPELINE = [
  {
    version: "0.1.0",
    date: "20. 3. 2026",
    status: "done",
    title: "Kalkulační wizard",
    summary: "Dva režimy zaměření, katalog položek, kalkulace, nabídka.",
    items: [
      { text: "Dva režimy zaměření", description: "Rychlý odhad (% za místnost) pro Martina, detailní soupis položek pro Richarda." },
      { text: "5 typů zakázek", description: "Byt/dům, kancelář, těžké břemeno, umělecké předměty, mezinárodní." },
      { text: "5 vozů z reálného ceníku", description: "15–36 m³ s hodinovými sazbami přímo od Stěhování Praha." },
      { text: "Katalog 40+ položek", description: "Reálné objemy v m³ — nábytek, elektronika, křehké, ostatní. Závislosti (postel → matrace)." },
      { text: "Materiálový krok", description: "Krabice, přepravky, stretch fólie, bublinková fólie, balící papír." },
      { text: "Live kalkulace", description: "Objem → auta → pracovníci → hodiny → cena. Výběr vozu s doporučením." },
      { text: "Nabídka pro klienta", description: "Rozpis ceny, soupis položek, rozsah práce, sdílení." },
    ],
  },
  {
    version: "0.1.1",
    date: "20. 3. 2026",
    status: "done",
    title: "Klientské prostředí",
    summary: "Feedback, komentáře, admin, PWA, iOS design.",
    items: [
      { text: "Zpětná vazba", description: "5 typů (Chci tohle, Změnit, Nechápu, Chybí mi, Líbí se) + pin komentáře přímo v prototypu." },
      { text: "Admin dashboard", description: "PIN přístup, filtry, stavy (nový/přečtený/řeší se/hotovo), poznámky, export, mazání." },
      { text: "Tab bar + Kalendář + Profil", description: "Mobilní navigace — zakázky, kalendář, nová zakázka, profil technika." },
      { text: "PWA", description: "Instalovatelná na homescreen, offline-ready, iOS safe areas, standalone mode." },
      { text: "iOS design systém", description: "44px touch targety, 12px typografie, 8pt grid, 12px border radii, safe areas." },
      { text: "Přístupová ochrana", description: "PIN kód pro vstup do prototypu, admin PIN, serverová ochrana přes proxy." },
    ],
  },
  {
    version: "0.2.0",
    date: "další sprint",
    status: "ready",
    title: "Auth & databáze",
    summary: "Přihlášení techniků, reálná data, klientská zóna.",
    items: [
      { text: "Přihlášení technika", description: "Login screen, role (obchodník, dispečer, technik)." },
      { text: "Neon Postgres", description: "Serverless databáze — zakázky, klienti, nabídky." },
      { text: "Reálný CRUD", description: "Vytváření, úprava, mazání zakázek — ne mock data." },
      { text: "Klientská zóna", description: "Klient vidí timeline své zakázky (stav, milníky, dokumenty)." },
    ],
  },
  {
    version: "0.3.0",
    date: "plánováno",
    status: "ready",
    title: "CRM & Workflow",
    summary: "Stavový model zakázky, timeline eventů, pipeline.",
    items: [
      { text: "Workflow zakázky", description: "Lead → Kontaktován → Zaměření → Nabídka → Schválení → Realizace → Fakturace → Zaplaceno." },
      { text: "Timeline eventů", description: "Každá akce = event. Audit log + UX vrstva. Klient vidí filtrovanou timeline." },
      { text: "Číselníky", description: "Služby, ceny, typy stěhování, příplatky — zdroj pravdy pro nabídky." },
      { text: "Pipeline dashboard", description: "Kanban view stavů zakázek pro dispečera." },
    ],
  },
  {
    version: "0.4.0",
    date: "plánováno",
    status: "ready",
    title: "Navigace & Logistika",
    summary: "Mapy, trasy, navigace do appek, tracking.",
    items: [
      { text: "Navigační deeplinky", description: "Tlačítko u adresy → Mapy.cz, Waze, Google Maps, Apple Maps." },
      { text: "Vizualizace trasy", description: "Centrála → nakládka → vykládka na mapě." },
      { text: "Automatický výpočet km", description: "API pro vzdálenost místo ručního zadávání." },
    ],
  },
  {
    version: "0.5.0",
    date: "plánováno",
    status: "ready",
    title: "PDF & Sdílení",
    summary: "PDF nabídky, odkaz pro klienta, podpis.",
    items: [
      { text: "PDF nabídka", description: "Firemní hlavička, číslo nabídky, podmínky, ke stažení nebo emailem." },
      { text: "Odkaz pro klienta", description: "Unikátní URL — klient otevře bez přihlášení." },
      { text: "Podpis na tabletu", description: "Klient podepíše prstem přímo na místě." },
    ],
  },
  {
    version: "0.6.0",
    date: "plánováno",
    status: "ready",
    title: "App Store",
    summary: "Nativní appka pro iOS a Android.",
    items: [
      { text: "Capacitor wrapper", description: "Nativní shell — stejný kód, nativní distribuce." },
      { text: "Kamera", description: "Focení položek při zaměření." },
      { text: "Push notifikace", description: "Nová zakázka, změna stavu, připomínky." },
      { text: "Offline-first", description: "Funguje bez signálu, sync po připojení." },
    ],
  },
]

const NOTES = [
  {
    id: "rn-015",
    version: "0.1.5",
    date: "20. 3. 2026",
    title: "iOS design a reálný ceník",
    description: "iOS design systém (44px touch targety, 8pt grid, safe areas). 5 vozů z reálného ceníku Stěhování Praha s hodinovými sazbami. 5 typů zakázek. Závislosti položek.",
    type: "change",
  },
  {
    id: "rn-014",
    version: "0.1.4",
    date: "20. 3. 2026",
    title: "Mobilní navigace",
    description: "Tab bar (Zakázky, Kalendář, Nový, Profil). Kalendář s nadcházejícími zakázkami. Profil technika s nastavením. PWA — instalovatelná na homescreen.",
    type: "feature",
  },
  {
    id: "rn-013",
    version: "0.1.3",
    date: "20. 3. 2026",
    title: "Komentáře a piny",
    description: "Pin komentáře přímo v prototypu (klávesa C). Kapkový marker, jméno autora. Zpětná vazba s 5 kategoriemi. Admin dashboard s filtry, stavy a exportem.",
    type: "feature",
  },
  {
    id: "rn-012",
    version: "0.1.2",
    date: "20. 3. 2026",
    title: "Ochrana přístupu",
    description: "Přístupový kód pro vstup do prototypu. Admin PIN. Serverová ochrana přes proxy.",
    type: "feature",
  },
  {
    id: "rn-011",
    version: "0.1.1",
    date: "20. 3. 2026",
    title: "Klientské prostředí",
    description: "Vrchní lišta s Timeline, Notes a Admin. Phone frame preview. Dev log s fázemi projektu. Release notes.",
    type: "feature",
  },
  {
    id: "rn-010",
    version: "0.1.0",
    date: "20. 3. 2026",
    title: "MVP Kalkulační wizard",
    description: "Dva režimy zaměření (rychlý odhad + detailní). Katalog 40+ položek. Kalkulační engine. Nabídka pro klienta.",
    type: "feature",
  },
]

async function seed() {
  console.log("Seeding pipeline...")
  await put("pipeline/data.json", JSON.stringify(PIPELINE), {
    contentType: "application/json",
    access: "private",
    addRandomSuffix: false,
  })
  console.log("Pipeline seeded.")

  console.log("Seeding release notes...")
  await put("pipeline/notes.json", JSON.stringify(NOTES), {
    contentType: "application/json",
    access: "private",
    addRandomSuffix: false,
  })
  console.log("Notes seeded.")

  console.log("Done!")
}

seed().catch(console.error)

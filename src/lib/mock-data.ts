export interface MockJob {
  id: string
  name: string
  client: string
  phone: string
  pickup: string
  delivery: string
  distance: number
  date: string
  floor: { pickup: number; delivery: number }
  elevator: { pickup: boolean; delivery: boolean }
  status: "survey" | "approval" | "execution" | "invoicing"
  statusLabel: string
  price: string
  statusColor: string
  highlight?: boolean
  actionable?: boolean
  time?: string
  sentDate?: string
  /** Poznámka dispečera pro briefing */
  dispatcherNote?: string
}

/** Today's date for mock data: 2026-03-20 */
export const TODAY = "2026-03-20"

export const MOCK_JOBS: MockJob[] = [
  {
    id: "dvorak", name: "Dvořák — Karlín \u2192 Modřany", client: "Petr Dvořák", phone: "+420 777 123 456",
    pickup: "Křižíkova 42, Praha 8", delivery: "Levského 3112, Praha 4",
    distance: 14, date: TODAY, floor: { pickup: 3, delivery: 1 }, elevator: { pickup: false, delivery: true },
    status: "survey", statusLabel: "Čeká na zaměření", price: "\u2014", statusColor: "text-blue-400",
    highlight: true, actionable: true, time: "09:00",
    dispatcherNote: "Klient preferuje dopolední termín. Pozor na úzké schodiště ve 2. patře.",
  },
  {
    id: "kowalski", name: "Kowalski — Smíchov \u2192 Dejvice", client: "Anna Kowalski", phone: "+420 608 222 333",
    pickup: "Stroupežnického 18, Praha 5", delivery: "Jugoslávských partyzánů 3, Praha 6",
    distance: 8, date: "2026-03-27", floor: { pickup: 2, delivery: 4 }, elevator: { pickup: true, delivery: true },
    status: "survey", statusLabel: "Čeká na zaměření", price: "\u2014", statusColor: "text-blue-400",
    highlight: true, actionable: true,
    dispatcherNote: "Klientka má velký klavír — nutné speciální balení.",
  },
  {
    id: "svobodova", name: "Svobodová — Vinohrady \u2192 Letňany", client: "Marie Svobodová", phone: "+420 731 444 555",
    pickup: "Korunní 88, Praha 2", delivery: "Tupolevova 710, Praha 9",
    distance: 18, date: "2026-03-18", floor: { pickup: 1, delivery: 0 }, elevator: { pickup: false, delivery: false },
    status: "approval", statusLabel: "Čeká na schválení", price: "32 100 Kč", statusColor: "text-yellow-400",
    sentDate: "2026-03-17",
  },
  {
    id: "novak", name: "Novák — Žižkov \u2192 Hostivař", client: "Tomáš Novák", phone: "+420 602 888 999",
    pickup: "Husitská 12, Praha 3", delivery: "Hornoměcholupská 55, Praha 10",
    distance: 11, date: TODAY, floor: { pickup: 4, delivery: 2 }, elevator: { pickup: true, delivery: false },
    status: "execution", statusLabel: "Realizace", price: "28 500 Kč", statusColor: "text-green-400",
    time: "14:00",
  },
  {
    id: "krejci", name: "Krejčí — Břevnov \u2192 Barrandov", client: "Lucie Krejčí", phone: "+420 775 666 777",
    pickup: "Bělohorská 90, Praha 6", delivery: "Ke Kaménce 4, Praha 5",
    distance: 9, date: "2026-03-25", floor: { pickup: 2, delivery: 3 }, elevator: { pickup: false, delivery: true },
    status: "execution", statusLabel: "Realizace", price: "19 800 Kč", statusColor: "text-green-400",
  },
  {
    id: "horakova", name: "Horáková — Nusle \u2192 Vršovice", client: "Jana Horáková", phone: "+420 720 111 222",
    pickup: "Táborská 30, Praha 4", delivery: "Kodaňská 12, Praha 10",
    distance: 5, date: "2026-03-15", floor: { pickup: 0, delivery: 1 }, elevator: { pickup: false, delivery: false },
    status: "invoicing", statusLabel: "K fakturaci", price: "15 200 Kč", statusColor: "text-purple-400",
  },
]

export interface CalendarEntry {
  id: string
  date: string
  client: string
  address: string
  status: string
  statusColor: string
}

export const CALENDAR_ENTRIES: CalendarEntry[] = [
  { id: "cal1", date: "2026-03-20", client: "Novotná Eva", address: "Vinohradská 18, Praha 2", status: "Zaměření", statusColor: "text-blue-400" },
  { id: "cal2", date: "2026-03-21", client: "Svoboda Tomáš", address: "Na Příkopě 5, Praha 1", status: "Stěhování", statusColor: "text-green-400" },
  { id: "cal3", date: "2026-03-23", client: "Petr Dvořák", address: "Křižíkova 42, Praha 8", status: "Zaměření", statusColor: "text-blue-400" },
  { id: "cal4", date: "2026-03-25", client: "Krejčí Lucie", address: "Bělohorská 90, Praha 6", status: "Nabídka odeslána", statusColor: "text-yellow-400" },
]

export function getMockJobById(id: string): MockJob | undefined {
  return MOCK_JOBS.find((j) => j.id === id)
}

// --- Notifications ---

export interface MockNotification {
  id: string
  type: "approval" | "rejection" | "message" | "change" | "comment"
  title: string
  body: string
  time: string // relative, e.g. "před 2 hod"
  read: boolean
  jobId?: string
}

const NOTIFICATION_TYPE_LABELS: Record<MockNotification["type"], string> = {
  approval: "Schválení",
  rejection: "Odmítnutí",
  message: "Zpráva",
  change: "Změna",
  comment: "Komentář",
}

export { NOTIFICATION_TYPE_LABELS }

export const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: "n1", type: "approval", title: "Svobodová schválila nabídku",
    body: "Nabídka 32 100 Kč byla schválena. Můžete naplánovat realizaci.",
    time: "před 2 hod", read: false, jobId: "svobodova",
  },
  {
    id: "n2", type: "message", title: "Dispečink: Kowalski přeplánován",
    body: "Termín zaměření přesunut z 27. 3. na 29. 3. — klientka požádala o změnu.",
    time: "před 5 hod", read: false, jobId: "kowalski",
  },
  {
    id: "n3", type: "comment", title: "Dvořák zanechal komentář",
    body: "\"Můžete přijet o půl hodiny dříve? Budu doma od 8:30.\"",
    time: "včera", read: true, jobId: "dvorak",
  },
  {
    id: "n4", type: "change", title: "Aktualizace ceníku",
    body: "Hodinové sazby vozidel byly aktualizovány od 1. 4. 2026.",
    time: "před 2 dny", read: true,
  },
  {
    id: "n5", type: "rejection", title: "Horáková odmítla nabídku",
    body: "Klientka odmítla nabídku 15 200 Kč. Důvod: příliš vysoká cena.",
    time: "před 3 dny", read: true, jobId: "horakova",
  },
]

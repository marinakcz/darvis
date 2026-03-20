import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Nabídka stěhování — Stěhování Praha",
  description: "Vaše nabídka na stěhování od Stěhování Praha",
}

// Mock data for the public offer — in future this will come from DB via token lookup
const MOCK_OFFER = {
  companyName: "Stěhování Praha",
  companyPhone: "+420 800 123 456",
  client: "Petr Dvořák",
  date: "čt 20. března 2026",
  pickup: "Křižíkova 42, Praha 8 · 3. patro bez výtahu",
  delivery: "Levského 3112, Praha 4 · 1. patro s výtahem",
  distance: "14 km",
  totalPrice: "24 800 Kč",
  volume: "12.4 m³",
  trucks: 1,
  workers: 2,
  hours: "4.5 hod",
  breakdown: [
    { label: "Doprava", value: "8 168 Kč" },
    { label: "Práce", value: "4 050 Kč" },
    { label: "Materiál", value: "1 720 Kč" },
    { label: "Příplatek patra", value: "1 350 Kč" },
  ],
  rooms: [
    { name: "Ložnice", detail: "25%" },
    { name: "Obývací pokoj", detail: "40%" },
    { name: "Kuchyň", detail: "15%" },
  ],
  note: "",
}

export default async function PublicOfferPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const offer = MOCK_OFFER // In future: look up by token

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Header */}
      <header className="border-b border-zinc-200 px-4 py-4">
        <div className="mx-auto max-w-lg flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-zinc-900">{offer.companyName}</h1>
            <p className="text-xs text-zinc-500">Profesionální stěhovací služby</p>
          </div>
          <a
            href={`tel:${offer.companyPhone.replace(/\s/g, "")}`}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-900 text-white px-3 py-2 text-sm font-medium hover:bg-zinc-800 transition-colors"
          >
            Zavolat
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6 flex flex-col gap-6">
        {/* Title + price */}
        <div className="text-center">
          <p className="text-sm text-zinc-500 mb-1">Nabídka stěhování pro</p>
          <h2 className="text-xl font-bold mb-4">{offer.client}</h2>
          <p className="text-4xl font-bold font-mono">{offer.totalPrice}</p>
          <p className="text-sm text-zinc-500 mt-1">{offer.date}</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <StatBox label="Objem" value={offer.volume} />
          <StatBox label="Aut" value={`${offer.trucks}x`} />
          <StatBox label="Lidí" value={`${offer.workers}`} />
          <StatBox label="Hodin" value={offer.hours} />
        </div>

        {/* Route */}
        <section className="rounded-xl border border-zinc-200 overflow-hidden divide-y divide-zinc-100">
          <div className="px-4 py-3">
            <p className="text-xs text-zinc-400 mb-0.5">Odkud</p>
            <p className="text-sm">{offer.pickup}</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-zinc-400 mb-0.5">Kam</p>
            <p className="text-sm">{offer.delivery}</p>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-xs text-zinc-400">Vzdálenost</span>
            <span className="text-sm font-mono">{offer.distance}</span>
          </div>
        </section>

        {/* Rooms */}
        <section className="rounded-xl border border-zinc-200 overflow-hidden">
          <div className="px-4 py-2.5 bg-zinc-50 text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Rozsah práce
          </div>
          <div className="divide-y divide-zinc-100">
            {offer.rooms.map((room) => (
              <div key={room.name} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span>{room.name}</span>
                <span className="font-mono text-zinc-500">{room.detail}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Price breakdown */}
        <section className="rounded-xl border border-zinc-200 overflow-hidden">
          <div className="px-4 py-2.5 bg-zinc-50 text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Rozpis ceny
          </div>
          <div className="divide-y divide-zinc-100">
            {offer.breakdown.map((item) => (
              <div key={item.label} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-zinc-600">{item.label}</span>
                <span className="font-mono">{item.value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between px-4 py-3 text-base font-bold">
              <span>Celkem</span>
              <span className="font-mono">{offer.totalPrice}</span>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <p className="text-center text-xs text-zinc-400 leading-relaxed">
          Cena je orientační a může se lišit dle skutečného rozsahu práce.
          Platnost nabídky 14 dní od data vystavení.
          Pojištění zásilky do 20 000 000 Kč v ceně.
        </p>

        {/* CTA */}
        <div className="flex flex-col gap-3 pt-2">
          <a
            href={`tel:${offer.companyPhone.replace(/\s/g, "")}`}
            className="flex items-center justify-center h-14 rounded-xl bg-zinc-900 text-white text-base font-medium hover:bg-zinc-800 transition-colors"
          >
            Mám dotaz — zavolat
          </a>
          <p className="text-center text-xs text-zinc-400">
            {offer.companyName} · {offer.companyPhone}
          </p>
        </div>
      </main>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-lg border border-zinc-200 py-2.5">
      <span className="font-mono text-base font-bold">{value}</span>
      <span className="text-[10px] text-zinc-400">{label}</span>
    </div>
  )
}

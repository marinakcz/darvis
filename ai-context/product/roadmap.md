# Timeline & Milestones

## Aktuální fáze
Blok 1 — Zaměření a nabídka (end-to-end)

## Milníky

### Hotovo: Validační prototyp (v0.1.x)
- [x] Wizard, katalog 60+ položek, kalkulační engine, nabídka
- [x] Feedback widget, admin panel, mobilní UI
- Vše na mock datech → archivováno v `backup/v0.1.x-prototype`

### Blok 1 — Zaměření a nabídka (aktuální)
- [x] Neon Postgres DB — customers, jobs, rooms, items, offers, events
- [x] Wizard ukládá zaměření do DB (debounced auto-save)
- [x] Nabídka se generuje z reálných dat + kalkulačka
- [x] Veřejná nabídka /offer/[token] (read-only, bílé téma)
- [x] Dashboard redesign: "Další v programu", status filtry, statistiky
- [x] Command Center: globální search, rychlé vytvoření zakázky
- [x] Manuální override ceny (sleva viditelná, přirážka skrytá)
- [x] Poznámky technika ukládání do DB
- [x] Poznámka pro klienta v nabídce
- [ ] PDF export nabídky
- [ ] Reálné notifikace (teď placeholder)

### Blok 2 — Schválení a pipeline
- Klient schvaluje/odmítá na odkazu
- Pipeline pohled pro dispečera (kanban)
- Chytré připomínky (nabídka expiruje, follow-up)
- Měsíční kalendář
- Klientský profil s historií
- Podpis, vCard export

### Blok 3 — Realizace
- Tisk zakázky (A4)
- Checklist pro posádku
- Přiřazení dispečerem
- Denní souhrn posádky
- Navigace deeplinks
- Fotodokumentace

### Blok 4 — Validace a fakturace
- Potvrzení dokončení
- Porovnání plán vs realita
- Generování faktury
- Hodnocení klientem

### Blok 5 — AI a optimalizace
- AI foto/video odhad objemu
- Chytré plánování (auto-scheduling)
- Auto-připomínky
- Dynamické ceny
- Párování zakázek (tam/zpět)
- Optimalizace tras
- Live tracking

## Co je odložené
- AI asistence (Blok 5)
- Více oborů než stěhování (architektura je ready, focus na pilota)
- Multi-tenant (single-tenant pro validaci)

## Princip
Sekvenční bloky — jeden fokus, dokončit, pak dál. Blok 1 musí být kuloodolný.

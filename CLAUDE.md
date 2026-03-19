@AGENTS.md

# Darvis

AI job assistant pro servisní firmy — řízení zakázek od obhlídky po zaplacení.

## Kontext

- **Pilotní zákazník:** Stěhování Praha (stehovanipraha.cz) — dlouhodobý klient
- **Fáze 1:** Validační MVP — digitální kalkulační flow (obhlídka → nabídka). Cíl: ukázat firmě, ověřit zájem.
- **Strategie:** Stavět pro stěhováky, ale architektura musí umožnit škálování na jiné obory (malíři, podlaháři, instalatéři).
- **Doména:** darvismind.com

## Design priority

**Mobile/tablet first, web last.** Obchodník používá tablet/mobil v terénu u klienta.

## Stack

- Next.js 16 (App Router, src/, TypeScript, Tailwind, Turbopack)
- shadcn/ui pro komponenty
- Vývoj lokálně (`next dev`), deploy na Vercel jen pro sdílení s klientem
- GitHub: marinakcz/darvis

## Fáze 1 — MVP scope

Digitalizace papírového kalkulačního flow Stěhování Praha:

1. **On-site zaměření** — obchodník u klienta kliká místnosti, položky, objem
2. **Kalkulace** — automatický výpočet (m³ → auta, položky → práce, materiál → náklady)
3. **Nabídka** — vygenerovaná nabídka pro klienta (PDF nebo odkaz)

Referenční dokument: `~/ai-studio/notes/AI-studio/01-projects/darvis/ideace/Manuální kalkulace.md`

## Pravidla

- Mobile-first vždy — každá komponenta musí fungovat na 375px+
- Žádný useEffect — derived state, event handlers, SWR, nebo key prop
- Nesmazat/nevytvářet soubory bez povolení uživatele
- Lokální vývoj, push jen hotové věci

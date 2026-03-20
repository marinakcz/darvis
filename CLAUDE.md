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

## Roadmapa

Sekvenční bloky — jeden fokus, dokončit, pak dál. Viz `~/ai-studio/notes/AI-studio/01-projects/darvis/ideace/Roadmapa.md`

### Hotovo: Validační prototyp (v0.1.x)
Wizard, katalog, kalkulace, nabídka, feedback, admin, mobilní UI. Vše na mock datech.

### Teď: Blok 1 — Zaměření a nabídka (end-to-end)
- Databáze (zakázky, klienti, nabídky) — pryč z mock dat
- Wizard ukládá zaměření do DB
- Nabídka se generuje z reálných dat a jde sdílet (odkaz)
- Klient vidí nabídku (read-only, bez přihlášení)
- PDF export nabídky

### Potom: Blok 2 — Schválení a pipeline
### Později: Blok 3 — Realizace, Blok 4 — Validace a fakturace, Blok 5 — AI

Referenční dokument: `~/ai-studio/notes/AI-studio/01-projects/darvis/ideace/Manuální kalkulace.md`

## Pravidla

- Mobile-first vždy — každá komponenta musí fungovat na 375px+
- Žádný useEffect — derived state, event handlers, SWR, nebo key prop
- Nesmazat/nevytvářet soubory bez povolení uživatele
- Lokální vývoj, push jen hotové věci

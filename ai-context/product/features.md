# Product Features

## Co projekt dělá
- Digitální kalkulační flow: obhlídka → nabídka → sdílení s klientem
- Wizard pro zadání zakázky v terénu (tablet/mobil)
- Per-room survey: quick mód (% zaplnění) nebo detailed (katalog 60+ položek)
- Automatická kalkulace ceny: objem → auta → lidi → hodiny → materiál → cena
- Manuální override ceny (sleva viditelná, přirážka skrytá v rozpisu)
- Sdílená nabídka pro klienta: veřejný odkaz bez přihlášení (/offer/[token])
- Dashboard s přehledem dnešních zakázek, stavů, akcí
- Command Center: globální search, rychlé vytvoření zakázky
- Customer search/upsert: vyhledání klienta podle telefonu
- Audit log: každá akce se loguje do job_events

## Co projekt nedělá (zatím)
- Schválení nabídky klientem (Blok 2)
- Pipeline/kanban pohled pro dispečera (Blok 2)
- Realizace a dispečink (Blok 3)
- Fakturace a platby (Blok 4)
- AI asistence, foto/video odhad, dynamické ceny (Blok 5)
- Komunikace s klientem (chat, SMS)
- Plánování tras a navigace
- Multi-tenant / více firem

## Klíčové sekce
- `/dashboard` — přehled zakázek, "další v programu", akce vyžadující pozornost
- `/jobs` — seznam všech zakázek se search a status filtry
- `/jobs/[id]` — detail zakázky (klient, trasa, poznámky, CTA "Zahájit zaměření")
- `/jobs/[id]/survey` — survey wizard (místnosti, položky, materiál, live kalkulace)
- `/jobs/[id]/offer` — náhled nabídky, úprava ceny, poznámka, odeslání
- `/offer/[token]` — veřejná nabídka pro klienta (bílé téma, read-only)
- `/calendar` — kalendář (placeholder, zatím bez backendu)

## Metriky úspěchu
- Čas vytvoření nabídky: z 30+ min manuálně na <10 min digitálně
- Počet nabídek odeslaných přes sdílení (vs. ručně)
- Conversion rate: nabídka → schválení (až bude Blok 2)

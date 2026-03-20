export interface ReleaseNote {
  id: string
  version: string
  date: string
  title: string
  description: string
  type: "feature" | "fix" | "change"
}

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    id: "rn-015",
    version: "0.1.5",
    date: "20. 3. 2026",
    title: "iOS design a reálný ceník",
    description:
      "iOS design systém (44px touch targety, 8pt grid, safe areas). 5 vozů z reálného ceníku Stěhování Praha s hodinovými sazbami. 5 typů zakázek. Závislosti položek.",
    type: "change",
  },
  {
    id: "rn-014",
    version: "0.1.4",
    date: "20. 3. 2026",
    title: "Mobilní navigace",
    description:
      "Tab bar (Zakázky, Kalendář, Nový, Profil). Kalendář s nadcházejícími zakázkami. Profil technika s nastavením. PWA — instalovatelná na homescreen.",
    type: "feature",
  },
  {
    id: "rn-013",
    version: "0.1.3",
    date: "20. 3. 2026",
    title: "Komentáře a piny",
    description:
      "Pin komentáře přímo v prototypu (klávesa C). Kapkový marker, jméno autora. Zpětná vazba s 5 kategoriemi. Admin dashboard s filtry, stavy a exportem.",
    type: "feature",
  },
  {
    id: "rn-012",
    version: "0.1.2",
    date: "20. 3. 2026",
    title: "Ochrana přístupu",
    description:
      "Přístupový kód pro vstup do prototypu. Admin PIN. Serverová ochrana přes proxy.",
    type: "feature",
  },
  {
    id: "rn-011",
    version: "0.1.1",
    date: "20. 3. 2026",
    title: "Klientské prostředí",
    description:
      "Vrchní lišta s Timeline, Notes a Admin. Phone frame preview. Dev log s fázemi projektu. Release notes.",
    type: "feature",
  },
  {
    id: "rn-010",
    version: "0.1.0",
    date: "20. 3. 2026",
    title: "MVP Kalkulační wizard",
    description:
      "Dva režimy zaměření (rychlý odhad + detailní). Katalog 40+ položek. Kalkulační engine. Nabídka pro klienta.",
    type: "feature",
  },
]

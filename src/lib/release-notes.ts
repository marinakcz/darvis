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
    id: "rn-012",
    version: "0.1.2",
    date: "20. 3. 2026",
    title: "Ochrana p\u0159\u00edstupu",
    description:
      "P\u0159\u00edstupov\u00fd k\u00f3d pro vstup do prototypu, admin PIN, serverov\u00e1 ochrana.",
    type: "feature",
  },
  {
    id: "rn-011",
    version: "0.1.1",
    date: "19. 3. 2026",
    title: "Zp\u011btn\u00e1 vazba a koment\u00e1\u0159e",
    description:
      "Plovouc\u00ed tla\u010d\u00edtko zp\u011btn\u00e9 vazby, pin koment\u00e1\u0159e v prototypu, admin dashboard s filtry a stavy.",
    type: "feature",
  },
  {
    id: "rn-010",
    version: "0.1.0",
    date: "18. 3. 2026",
    title: "MVP Kalkula\u010dn\u00ed wizard",
    description:
      "Dva re\u017eimy zam\u011b\u0159en\u00ed (rychl\u00fd odhad + detailn\u00ed), katalog 40 polo\u017eek, kalkula\u010dn\u00ed engine, nab\u00eddka pro klienta.",
    type: "feature",
  },
]

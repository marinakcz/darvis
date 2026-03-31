/** Tag pill badge — malý barevný label pro tagy na zakázkách */

const TAG_COLORS: Record<string, string> = {
  // Priorita
  high: "bg-red-500/15 text-red-400 border-red-500/20",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  low: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
  // Typ objektu
  byt: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  dům: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  kancelář: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  sklad: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  // Zdroj
  web: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  call: "bg-green-500/15 text-green-400 border-green-500/20",
  referral: "bg-pink-500/15 text-pink-400 border-pink-500/20",
  // Akce
  volat: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  napsat: "bg-sky-500/15 text-sky-400 border-sky-500/20",
  naplánovat: "bg-amber-500/15 text-amber-400 border-amber-500/20",
}

const DEFAULT_COLOR = "bg-zinc-500/15 text-zinc-400 border-zinc-500/20"

interface TagPillProps {
  tag: string
  size?: "sm" | "xs"
}

export function TagPill({ tag, size = "xs" }: TagPillProps) {
  const color = TAG_COLORS[tag.toLowerCase()] ?? DEFAULT_COLOR
  const sizeClass = size === "sm" ? "text-[11px] px-2 py-0.5" : "text-[10px] px-1.5 py-0.5"

  return (
    <span className={`inline-flex items-center rounded-md border font-medium ${color} ${sizeClass}`}>
      {tag}
    </span>
  )
}

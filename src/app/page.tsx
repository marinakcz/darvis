import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16 bg-zinc-950">
      <div className="flex flex-col items-center gap-5">
        <Image
          src="/logo.svg"
          alt="Darvis"
          width={180}
          height={48}
          priority
          className="h-12 w-auto"
        />
        <p className="max-w-xs text-center text-base text-zinc-500">
          Řízení zakázek od obhlídky po zaplacení
        </p>
      </div>
      <Link
        href="/survey?step=0"
        className="inline-flex h-14 items-center justify-center rounded-lg bg-white px-10 text-base font-semibold text-zinc-950 transition-colors hover:bg-zinc-200 active:bg-zinc-300"
      >
        Spustit demo
      </Link>
      <p className="text-[11px] text-zinc-700 font-mono">
        v0.1.0 — MVP kalkulace
      </p>
    </div>
  )
}

"use client"

import { useState } from "react"
import Image from "next/image"

export default function AccessPage() {
  const [digits, setDigits] = useState(["", "", "", ""])
  const [error, setError] = useState(false)

  function handleInput(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    setError(false)

    if (digit && index < 3) {
      document.getElementById(`gate-${index + 1}`)?.focus()
    }

    const fullPin = next.join("")
    if (fullPin.length === 4 && next.every((d) => d !== "")) {
      fetch("/api/access/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: fullPin }),
      }).then((res) => {
        if (res.ok) {
          // Cookie set by server — redirect to app
          window.location.href = "/survey?step=0"
        } else {
          setError(true)
          setDigits(["", "", "", ""])
          setTimeout(() => document.getElementById("gate-0")?.focus(), 50)
        }
      })
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      document.getElementById(`gate-${index - 1}`)?.focus()
      const next = [...digits]
      next[index - 1] = ""
      setDigits(next)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 w-full max-w-sm px-6">
        <Image
          src="/logo.svg"
          alt="Darvis"
          width={120}
          height={32}
          className="h-8 w-auto opacity-60"
        />
        <h1 className="text-lg font-semibold text-zinc-200">Přístupový kód</h1>

        <div className="flex gap-3">
          {digits.map((digit, i) => (
            <input
              key={i}
              id={`gate-${i}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit ? "\u2022" : ""}
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              autoFocus={i === 0}
              className={`w-12 h-14 text-center text-xl rounded-xl border-2 bg-zinc-900 outline-none transition-all ${
                error
                  ? "border-red-500/50 bg-red-500/5"
                  : digit
                    ? "border-zinc-500 bg-zinc-800"
                    : "border-zinc-700 focus:border-zinc-500"
              }`}
            />
          ))}
        </div>

        {error && <p className="text-sm text-red-400">Nesprávný kód</p>}
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import Image from "next/image"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const COOKIE_CHECK_KEY = "darvis-access-checked"

export function AccessGate({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(() => {
    if (typeof window === "undefined") return false
    return sessionStorage.getItem(COOKIE_CHECK_KEY) === "ok"
  })
  const [checked, setChecked] = useState(false)
  const [pin, setPin] = useState("")
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check if access cookie is already valid
  if (!checked && !authorized) {
    setChecked(true)
    fetch("/api/access/check")
      .then((r) => {
        if (r.ok) {
          sessionStorage.setItem(COOKIE_CHECK_KEY, "ok")
          setAuthorized(true)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  function handleSubmit() {
    if (pin.length < 1) return
    fetch("/api/access/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    }).then((res) => {
      if (res.ok) {
        sessionStorage.setItem(COOKIE_CHECK_KEY, "ok")
        setAuthorized(true)
      } else {
        setError(true)
        setPin("")
      }
    })
  }

  if (authorized) return <>{children}</>

  // Show nothing while checking cookie
  if (loading) return <div className="min-h-screen bg-zinc-950" />

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 flex items-center justify-center">
      <div className="flex flex-col items-center gap-5 w-full max-w-xs px-6">
        <Image
          src="/logo.svg"
          alt="Darvis"
          width={120}
          height={32}
          className="h-8 w-auto opacity-60"
        />
        <div className="text-center">
          <h1 className="text-lg font-semibold">Přístupový kód</h1>
        </div>
        <Input
          type="password"
          value={pin}
          onChange={(e) => { setPin(e.target.value); setError(false) }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Zadejte kód"
          className="h-12 text-center text-lg tracking-widest"
          autoFocus
        />
        {error && <p className="text-sm text-red-400">Nesprávný kód</p>}
        <Button className="w-full h-11" onClick={handleSubmit} disabled={pin.length < 1}>
          Vstoupit
        </Button>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  type FeedbackType,
  FEEDBACK_TYPES,
  submitFeedback,
} from "@/lib/feedback"
import { FeedbackIcon } from "@/components/icons"
import { MessageCircle, X, ArrowLeft, Check } from "lucide-react"

export function openFeedbackModal() {
  window.dispatchEvent(new Event("darvis:open-feedback"))
}

export function FeedbackButton() {
  const [open, setOpen] = useState(false)

  // Register global listener
  if (typeof window !== "undefined") {
    ;(window as unknown as { __darvisFb?: () => void }).__darvisFb?.()
    const handler = () => setOpen(true)
    window.addEventListener("darvis:open-feedback", handler)
    ;(window as unknown as { __darvisFb?: () => void }).__darvisFb = () =>
      window.removeEventListener("darvis:open-feedback", handler)
  }

  const [step, setStep] = useState<"type" | "form" | "done">("type")
  const [type, setType] = useState<FeedbackType | null>(null)
  const [message, setMessage] = useState("")
  const [author, setAuthor] = useState("")

  function reset() {
    setOpen(false)
    setStep("type")
    setType(null)
    setMessage("")
  }

  function handleSelectType(t: FeedbackType) {
    setType(t)
    setStep("form")
  }

  function handleSubmit() {
    if (!type || message.length < 3) return
    submitFeedback({
      type,
      message,
      author: author || undefined,
      page: typeof window !== "undefined" ? window.location.pathname + window.location.search : "",
    })
    setStep("done")
    setTimeout(reset, 2500)
  }

  return (
    <>
      {/* FAB */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-12 items-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-zinc-900 shadow-lg shadow-black/20 transition-transform hover:scale-105 active:scale-95"
      >
        <MessageCircle className="size-4" />
        Zpětná vazba
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={reset} />
          <div className="relative w-full max-w-[400px] rounded-2xl bg-zinc-900 border border-zinc-800 p-5 shadow-2xl">
            <button type="button" onClick={reset} className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-300">
              <X className="size-5" />
            </button>

            {step === "type" && (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-base font-semibold text-zinc-100">Vaše zpětná vazba</h2>
                  <p className="text-sm text-zinc-500 mt-1">Pomůže nám vytvořit aplikaci přesně pro vás.</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(FEEDBACK_TYPES) as [FeedbackType, typeof FEEDBACK_TYPES[FeedbackType]][]).map(
                    ([key, { label, description }]) => {
                      const Icon = FeedbackIcon[key]
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleSelectType(key)}
                          className="flex flex-col items-start gap-1 rounded-xl border border-zinc-800 p-3 text-left transition-colors hover:bg-zinc-800 hover:border-zinc-700"
                        >
                          <Icon className="size-5 text-zinc-400" />
                          <span className="text-sm font-medium text-zinc-200">{label}</span>
                          <span className="text-[11px] text-zinc-500 leading-tight">{description}</span>
                        </button>
                      )
                    },
                  )}
                </div>
              </div>
            )}

            {step === "form" && type && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setStep("type")} className="text-zinc-500 hover:text-zinc-300">
                    <ArrowLeft className="size-4" />
                  </button>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800 px-2.5 py-1 text-sm">
                    {(() => { const Icon = FeedbackIcon[type]; return <Icon className="size-3.5 text-zinc-400" /> })()}
                    <span className="text-zinc-300">{FEEDBACK_TYPES[type].label}</span>
                  </span>
                </div>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={FEEDBACK_TYPES[type].placeholder}
                  rows={4}
                  maxLength={2000}
                  autoFocus
                  className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none"
                />

                <Input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Vaše jméno (nepovinné)"
                  className="h-9 text-sm"
                />

                <Button size="lg" className="h-12 text-sm" onClick={handleSubmit} disabled={message.length < 3}>
                  Odeslat
                </Button>
              </div>
            )}

            {step === "done" && (
              <div className="flex flex-col items-center gap-3 py-6">
                <Check className="size-8 text-emerald-400" />
                <p className="text-sm font-medium text-zinc-200">Díky za zpětnou vazbu!</p>
                <p className="text-xs text-zinc-500">Budeme se tím zabývat.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

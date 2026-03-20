"use client"

import { useState, useSyncExternalStore } from "react"
import SurveyContent from "@/components/survey/survey-content"

// Ensure component only renders on client (avoids hydration mismatch from localStorage)
function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

export default function SurveyPage() {
  const mounted = useIsMounted()
  if (!mounted) return null
  return <SurveyContent />
}

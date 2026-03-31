"use client"

import { useState, useRef } from "react"
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion"
import { Check, Phone, ArrowRight, Clock, StickyNote, X } from "lucide-react"

export interface SwipeAction {
  id: string
  label: string
  icon: React.ReactNode
  color: string
  bgColor: string
}

const SWIPE_RIGHT_ACTIONS: SwipeAction[] = [
  { id: "done", label: "Vyřízeno", icon: <Check className="size-5" />, color: "text-emerald-400", bgColor: "bg-emerald-500/20" },
  { id: "called", label: "Zavoláno", icon: <Phone className="size-5" />, color: "text-blue-400", bgColor: "bg-blue-500/20" },
  { id: "advance", label: "Posunout", icon: <ArrowRight className="size-5" />, color: "text-violet-400", bgColor: "bg-violet-500/20" },
]

const SWIPE_LEFT_ACTIONS: SwipeAction[] = [
  { id: "remind", label: "Připomenout", icon: <Clock className="size-5" />, color: "text-amber-400", bgColor: "bg-amber-500/20" },
  { id: "note", label: "Poznámka", icon: <StickyNote className="size-5" />, color: "text-sky-400", bgColor: "bg-sky-500/20" },
  { id: "reject", label: "Zamítnout", icon: <X className="size-5" />, color: "text-red-400", bgColor: "bg-red-500/20" },
]

const THRESHOLD = 80

interface SwipeableCardProps {
  children: React.ReactNode
  onSwipeAction: (actionId: string) => void
  className?: string
}

export function SwipeableCard({ children, onSwipeAction, className = "" }: SwipeableCardProps) {
  const x = useMotionValue(0)
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Background opacity based on drag distance
  const rightOpacity = useTransform(x, [0, THRESHOLD], [0, 1])
  const leftOpacity = useTransform(x, [-THRESHOLD, 0], [1, 0])

  // Determine which action is active based on drag distance
  function getAction(offset: number): SwipeAction | null {
    if (offset > THRESHOLD) {
      const actions = SWIPE_RIGHT_ACTIONS
      const idx = Math.min(Math.floor((offset - THRESHOLD) / 60), actions.length - 1)
      return actions[idx]
    }
    if (offset < -THRESHOLD) {
      const actions = SWIPE_LEFT_ACTIONS
      const idx = Math.min(Math.floor((-offset - THRESHOLD) / 60), actions.length - 1)
      return actions[idx]
    }
    return null
  }

  function handleDrag(_: unknown, info: PanInfo) {
    const action = getAction(info.offset.x)
    setActiveAction(action?.id ?? null)
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    const action = getAction(info.offset.x)
    if (action) {
      onSwipeAction(action.id)
    }
    setActiveAction(null)
  }

  const currentRightAction = SWIPE_RIGHT_ACTIONS.find((a) => a.id === activeAction)
  const currentLeftAction = SWIPE_LEFT_ACTIONS.find((a) => a.id === activeAction)

  return (
    <div ref={containerRef} className={`relative overflow-hidden rounded-2xl ${className}`}>
      {/* Right swipe background (behind card, left side) */}
      <motion.div
        className="absolute inset-0 flex items-center pl-5"
        style={{ opacity: rightOpacity }}
      >
        {currentRightAction ? (
          <div className={`flex items-center gap-2 ${currentRightAction.color}`}>
            {currentRightAction.icon}
            <span className="text-xs font-medium">{currentRightAction.label}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-text-tertiary">
            <ArrowRight className="size-4" />
          </div>
        )}
      </motion.div>

      {/* Left swipe background (behind card, right side) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-end pr-5"
        style={{ opacity: leftOpacity }}
      >
        {currentLeftAction ? (
          <div className={`flex items-center gap-2 ${currentLeftAction.color}`}>
            <span className="text-xs font-medium">{currentLeftAction.label}</span>
            {currentLeftAction.icon}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-text-tertiary">
            <Clock className="size-4" />
          </div>
        )}
      </motion.div>

      {/* Draggable card */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -200, right: 200 }}
        dragElastic={0.2}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        className="relative z-10 bg-surface-1 touch-pan-y"
      >
        {children}
      </motion.div>
    </div>
  )
}

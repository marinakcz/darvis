import {
  BedDouble,
  Sofa,
  CookingPot,
  ShowerHead,
  DoorOpen,
  Package,
  ToyBrick,
  Monitor,
  ClipboardList,
  Armchair,
  Tv,
  AlertTriangle,
  Box,
  Zap,
  FileText,
  Target,
  Wrench,
  HelpCircle,
  Plus,
  ThumbsUp,
  MessageCircle,
  RotateCcw,
  type LucideProps,
} from "lucide-react"
import type { RoomType, ItemCategory } from "@/lib/types"
import type { FeedbackType } from "@/lib/feedback"
import type { ComponentType } from "react"

export const RoomIcon: Record<RoomType, ComponentType<LucideProps>> = {
  bedroom: BedDouble,
  living: Sofa,
  kitchen: CookingPot,
  bathroom: ShowerHead,
  hallway: DoorOpen,
  basement: Package,
  kids: ToyBrick,
  office: Monitor,
  other: ClipboardList,
}

export const CategoryIcon: Record<ItemCategory, ComponentType<LucideProps>> = {
  furniture: Armchair,
  electronics: Tv,
  fragile: AlertTriangle,
  other: Box,
}

export const FeedbackIcon: Record<FeedbackType, ComponentType<LucideProps>> = {
  want: Target,
  change: Wrench,
  confusing: HelpCircle,
  missing: Plus,
  love: ThumbsUp,
}

export const ModeIcons = {
  quick: Zap,
  detailed: FileText,
}

export { MessageCircle, RotateCcw, Zap, FileText }

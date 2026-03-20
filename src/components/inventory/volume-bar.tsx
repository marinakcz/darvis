"use client"

import type { Job } from "@/lib/types"
import { getCatalogItem } from "@/lib/catalog"
import { formatVolume } from "@/lib/calculator"
import { TRUCK_CAPACITY } from "@/lib/constants"
import { Badge } from "@/components/ui/badge"

interface VolumeBarProps {
  job: Job
}

export function VolumeBar({ job }: VolumeBarProps) {
  let totalVolume: number

  if (job.mode === "quick") {
    const totalPercent = (job.quickRooms ?? []).reduce((sum, r) => sum + r.percent, 0)
    totalVolume = (totalPercent / 100) * TRUCK_CAPACITY
  } else {
    totalVolume = (job.rooms ?? []).reduce((sum, room) => {
      return (
        sum +
        room.items.reduce((rSum, item) => {
          const cat = getCatalogItem(item.catalogId)
          return rSum + (cat ? cat.volume * item.quantity : 0)
        }, 0)
      )
    }, 0)
  }

  const trucks = Math.max(1, Math.ceil(totalVolume / TRUCK_CAPACITY))

  if (totalVolume === 0) return null

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="font-mono text-xs">
        {formatVolume(totalVolume)}
      </Badge>
      <Badge variant="secondary" className="font-mono text-xs">
        {trucks} auto{trucks > 1 ? "a" : ""}
      </Badge>
    </div>
  )
}

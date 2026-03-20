"use client"

import { useState } from "react"
import { CATALOG } from "@/lib/catalog"
import { CATEGORY_LABELS } from "@/lib/types"
import { CategoryIcon } from "@/components/icons"
import type { ItemCategory } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"

const CATEGORIES: ItemCategory[] = ["furniture", "electronics", "fragile", "other"]

interface ItemPickerProps {
  onSelect: (catalogId: string) => void
  onClose: () => void
}

export function ItemPicker({ onSelect, onClose }: ItemPickerProps) {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<ItemCategory | null>(null)

  const filtered = CATALOG.filter((item) => {
    if (activeCategory && item.category !== activeCategory) return false
    if (search) {
      return item.name.toLowerCase().includes(search.toLowerCase())
    }
    return true
  })

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Vyberte položku</span>
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>

      <Input
        placeholder="Hledat…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-9"
      />

      {/* Category tabs */}
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
            activeCategory === null ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
          }`}
        >
          Vše
        </button>
        {CATEGORIES.map((cat) => {
          const Icon = CategoryIcon[cat]
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                activeCategory === cat ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
              }`}
            >
              <Icon className="size-3" />
              {CATEGORY_LABELS[cat]}
            </button>
          )
        })}
      </div>

      {/* Items grid */}
      <ScrollArea className="max-h-[240px]">
        <div className="grid grid-cols-2 gap-1.5">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className="flex flex-col items-start rounded-md border border-border p-2 text-left text-xs transition-colors hover:bg-accent active:bg-accent"
            >
              <span className="font-medium">{item.name}</span>
              <span className="font-mono text-muted-foreground">
                {item.volume} m³
              </span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

"use client"

import { useState } from "react"
import { CATALOG } from "@/lib/catalog"
import { CATEGORY_LABELS } from "@/lib/types"
import { CategoryIcon } from "@/components/icons"
import type { ItemCategory } from "@/lib/types"
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
    <div className="fixed inset-0 z-50 flex flex-col justify-end ios-sheet-backdrop">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 ios-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Sheet content */}
      <div className="relative rounded-t-2xl bg-background border-t border-border pb-[env(safe-area-inset-bottom)] ios-sheet-content max-h-[85vh] flex flex-col">
        {/* Drag indicator */}
        <div className="flex justify-center pt-2 pb-1 shrink-0">
          <div className="h-[5px] w-[36px] rounded-full bg-muted-foreground/30" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 pt-1 shrink-0">
          <h2 className="text-base font-semibold">Vyberte položku</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zavřít výběr položky"
            className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-2 shrink-0">
          <Input
            placeholder="Hledat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
            aria-label="Hledat položku"
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 px-4 pb-3 shrink-0 overflow-x-auto" role="tablist" aria-label="Kategorie položek">
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === null}
            onClick={() => setActiveCategory(null)}
            className={`h-9 rounded-lg px-3 py-2 text-xs font-medium transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
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
                role="tab"
                aria-selected={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1 h-9 rounded-lg px-3 py-2 text-xs font-medium transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
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
        <ScrollArea className="flex-1 px-4 pb-6">
          <div className="grid grid-cols-2 gap-2">
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className="flex flex-col items-start rounded-xl border border-border p-2 min-h-[44px] text-left text-xs transition-colors hover:bg-accent active:bg-accent"
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
    </div>
  )
}

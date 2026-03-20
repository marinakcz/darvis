// SwiftUI: List row with Stepper
"use client"

import type { InventoryItem } from "@/lib/types"
import { getCatalogItem } from "@/lib/catalog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

interface ItemRowProps {
  item: InventoryItem
  onUpdate: (updater: (item: InventoryItem) => InventoryItem) => void
  onRemove: () => void
}

export function ItemRow({ item, onUpdate, onRemove }: ItemRowProps) {
  const catalog = getCatalogItem(item.catalogId)
  if (!catalog) return null

  function setQuantity(delta: number) {
    const next = item.quantity + delta
    if (next < 1) {
      onRemove()
      return
    }
    onUpdate((i) => ({ ...i, quantity: next }))
  }

  function toggleService(key: keyof InventoryItem["services"]) {
    onUpdate((i) => ({
      ...i,
      services: { ...i.services, [key]: !i.services[key] },
    }))
  }

  const volume = catalog.volume * item.quantity

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border p-2.5">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-medium">{catalog.name}</span>
          <span className="font-mono text-xs text-muted-foreground">
            {volume.toFixed(2)} m³
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-11 w-11 p-0 text-lg"
            onClick={() => setQuantity(-1)}
            aria-label={`Ubrat ${catalog.name}`}
          >
            −
          </Button>
          <span className="w-8 text-center font-mono text-sm font-medium" aria-live="polite" aria-label={`${catalog.name}: ${item.quantity} kusů`}>
            {item.quantity}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-11 w-11 p-0 text-lg"
            onClick={() => setQuantity(1)}
            aria-label={`Přidat ${catalog.name}`}
          >
            +
          </Button>
        </div>
      </div>

      {/* Services toggles */}
      <div className="flex gap-3 text-xs">
        <ServiceToggle
          label="Demontáž"
          checked={item.services.disassembly}
          onChange={() => toggleService("disassembly")}
        />
        <ServiceToggle
          label="Balení"
          checked={item.services.packing}
          onChange={() => toggleService("packing")}
        />
        <ServiceToggle
          label="Montáž"
          checked={item.services.assembly}
          onChange={() => toggleService("assembly")}
        />
      </div>
    </div>
  )
}

function ServiceToggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="flex items-center gap-1.5 cursor-pointer">
      <Switch checked={checked} onCheckedChange={onChange} className="scale-75" />
      <span className={checked ? "text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
    </label>
  )
}

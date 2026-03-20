"use client"

import { useState } from "react"
import type { Room, InventoryItem } from "@/lib/types"
import { ROOM_LABELS } from "@/lib/types"
import { RoomIcon } from "@/components/icons"
import { getCatalogItem } from "@/lib/catalog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Info } from "lucide-react"
import { ItemPicker } from "./item-picker"
import { ItemRow } from "./item-row"

interface RoomPanelProps {
  room: Room
  onUpdate: (updater: (room: Room) => Room) => void
  onRemove: () => void
}

export function RoomPanel({ room, onUpdate, onRemove }: RoomPanelProps) {
  const [showItemPicker, setShowItemPicker] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const Icon = RoomIcon[room.type]

  const totalVolume = room.items.reduce((sum, item) => {
    const cat = getCatalogItem(item.catalogId)
    return sum + (cat ? cat.volume * item.quantity : 0)
  }, 0)

  function addItem(catalogId: string) {
    const existing = room.items.find((i) => i.catalogId === catalogId)
    if (existing) {
      onUpdate((r) => ({
        ...r,
        items: r.items.map((i) =>
          i.catalogId === catalogId ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      }))
    } else {
      const cat = getCatalogItem(catalogId)
      const newItem: InventoryItem = {
        id: `item-${Date.now()}`,
        catalogId,
        quantity: 1,
        services: cat?.defaultServices ?? {
          disassembly: false,
          packing: false,
          assembly: false,
        },
      }

      // Auto-add required items
      const requiredItems: InventoryItem[] = []
      const addedNames: string[] = []
      if (cat?.requires) {
        for (const reqId of cat.requires) {
          const alreadyExists = room.items.some((i) => i.catalogId === reqId)
          if (!alreadyExists) {
            const reqCat = getCatalogItem(reqId)
            if (reqCat) {
              requiredItems.push({
                id: `item-${Date.now()}-${reqId}`,
                catalogId: reqId,
                quantity: 1,
                services: reqCat.defaultServices,
              })
              addedNames.push(reqCat.name)
            }
          }
        }
      }

      onUpdate((r) => ({ ...r, items: [...r.items, newItem, ...requiredItems] }))

      if (addedNames.length > 0) {
        setToast(`Automaticky přidáno: ${addedNames.join(", ")}`)
        setTimeout(() => setToast(null), 3000)
      }
    }
    setShowItemPicker(false)
  }

  function updateItem(itemId: string, updater: (item: InventoryItem) => InventoryItem) {
    onUpdate((r) => ({
      ...r,
      items: r.items.map((i) => (i.id === itemId ? updater(i) : i)),
    }))
  }

  function removeItem(itemId: string) {
    onUpdate((r) => ({
      ...r,
      items: r.items.filter((i) => i.id !== itemId),
    }))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Icon className="size-5 text-muted-foreground" />
          <CardTitle className="text-base">
            {ROOM_LABELS[room.type]}
            {room.customName ? ` (${room.customName})` : ""}
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono text-xs">
            {totalVolume.toFixed(1)} m³
          </Badge>
          <Button variant="ghost" size="icon-sm" className="text-muted-foreground" onClick={onRemove} aria-label={`Odebrat ${ROOM_LABELS[room.type]}`}>
            <X className="size-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        {toast && (
          <div className="flex items-center gap-2 rounded-md bg-primary/10 border border-primary/20 px-3 py-2 text-xs text-primary">
            <Info className="size-3.5 shrink-0" />
            <span>{toast}</span>
          </div>
        )}
        {room.items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            onUpdate={(updater) => updateItem(item.id, updater)}
            onRemove={() => removeItem(item.id)}
          />
        ))}

        {showItemPicker ? (
          <ItemPicker
            onSelect={addItem}
            onClose={() => setShowItemPicker(false)}
          />
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-10 border-dashed"
            onClick={() => setShowItemPicker(true)}
          >
            + Přidat položku
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

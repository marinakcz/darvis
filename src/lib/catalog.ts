import type { CatalogItem } from "./types"

export const CATALOG: CatalogItem[] = [
  // Nábytek
  { id: "wardrobe-large", name: "Skříň velká", category: "furniture", volume: 1.2, defaultServices: { disassembly: true, packing: false, assembly: true } },
  { id: "wardrobe-small", name: "Skříň malá", category: "furniture", volume: 0.6, defaultServices: { disassembly: true, packing: false, assembly: true } },
  { id: "bed-double", name: "Postel dvoulůžko", category: "furniture", volume: 1.2, defaultServices: { disassembly: true, packing: false, assembly: true } },
  { id: "bed-single", name: "Postel jednolůžko", category: "furniture", volume: 0.8, defaultServices: { disassembly: true, packing: false, assembly: true } },
  { id: "mattress", name: "Matrace", category: "furniture", volume: 0.4, defaultServices: { disassembly: false, packing: true, assembly: false } },
  { id: "sofa-large", name: "Pohovka / Gauč", category: "furniture", volume: 1.5, defaultServices: { disassembly: false, packing: true, assembly: false } },
  { id: "sofa-small", name: "Křeslo", category: "furniture", volume: 0.5, defaultServices: { disassembly: false, packing: false, assembly: false } },
  { id: "table-dining", name: "Jídelní stůl", category: "furniture", volume: 0.5, defaultServices: { disassembly: true, packing: false, assembly: true } },
  { id: "table-desk", name: "Psací stůl", category: "furniture", volume: 0.4, defaultServices: { disassembly: true, packing: false, assembly: true } },
  { id: "table-coffee", name: "Konferenční stolek", category: "furniture", volume: 0.2, defaultServices: { disassembly: false, packing: false, assembly: false } },
  { id: "chair", name: "Židle", category: "furniture", volume: 0.15, defaultServices: { disassembly: false, packing: false, assembly: false } },
  { id: "dresser", name: "Komoda", category: "furniture", volume: 0.4, defaultServices: { disassembly: true, packing: false, assembly: true } },
  { id: "bookshelf", name: "Knihovna / Regál", category: "furniture", volume: 0.5, defaultServices: { disassembly: true, packing: false, assembly: true } },
  { id: "tv-stand", name: "TV stolek", category: "furniture", volume: 0.3, defaultServices: { disassembly: true, packing: false, assembly: true } },
  { id: "shoe-rack", name: "Botník", category: "furniture", volume: 0.2, defaultServices: { disassembly: false, packing: false, assembly: false } },
  { id: "cabinet-kitchen", name: "Kuchyňská linka (segment)", category: "furniture", volume: 0.3, defaultServices: { disassembly: true, packing: false, assembly: true } },
  { id: "nightstand", name: "Noční stolek", category: "furniture", volume: 0.1, defaultServices: { disassembly: false, packing: false, assembly: false } },

  // Elektronika
  { id: "tv-large", name: "Televize (velká)", category: "electronics", volume: 0.2, defaultServices: { disassembly: false, packing: true, assembly: false } },
  { id: "tv-small", name: "Televize (malá)", category: "electronics", volume: 0.1, defaultServices: { disassembly: false, packing: true, assembly: false } },
  { id: "washing-machine", name: "Pračka", category: "electronics", volume: 0.35, defaultServices: { disassembly: false, packing: false, assembly: false } },
  { id: "dryer", name: "Sušička", category: "electronics", volume: 0.35, defaultServices: { disassembly: false, packing: false, assembly: false } },
  { id: "fridge", name: "Lednice", category: "electronics", volume: 0.5, defaultServices: { disassembly: false, packing: false, assembly: false } },
  { id: "fridge-large", name: "Lednice americká", category: "electronics", volume: 0.8, defaultServices: { disassembly: false, packing: false, assembly: false } },
  { id: "dishwasher", name: "Myčka", category: "electronics", volume: 0.3, defaultServices: { disassembly: false, packing: false, assembly: false } },
  { id: "oven", name: "Trouba / Sporák", category: "electronics", volume: 0.3, defaultServices: { disassembly: false, packing: false, assembly: false } },
  { id: "microwave", name: "Mikrovlnka", category: "electronics", volume: 0.05, defaultServices: { disassembly: false, packing: true, assembly: false } },
  { id: "pc-desktop", name: "Počítač (desktop)", category: "electronics", volume: 0.1, defaultServices: { disassembly: false, packing: true, assembly: false } },

  // Křehké
  { id: "mirror-large", name: "Zrcadlo velké", category: "fragile", volume: 0.15, defaultServices: { disassembly: false, packing: true, assembly: false } },
  { id: "mirror-small", name: "Zrcadlo malé", category: "fragile", volume: 0.05, defaultServices: { disassembly: false, packing: true, assembly: false } },
  { id: "painting", name: "Obraz / Rám", category: "fragile", volume: 0.05, defaultServices: { disassembly: false, packing: true, assembly: false } },
  { id: "chandelier", name: "Lustr", category: "fragile", volume: 0.1, defaultServices: { disassembly: true, packing: true, assembly: true } },
  { id: "aquarium", name: "Akvárium", category: "fragile", volume: 0.3, defaultServices: { disassembly: false, packing: true, assembly: false } },
  { id: "plants", name: "Květiny (velká)", category: "fragile", volume: 0.15, defaultServices: { disassembly: false, packing: false, assembly: false } },

  // Ostatní
  { id: "box-standard", name: "Krabice (stěhovací)", category: "other", volume: 0.06, defaultServices: { disassembly: false, packing: false, assembly: false } },
  { id: "box-large", name: "Krabice velká", category: "other", volume: 0.12, defaultServices: { disassembly: false, packing: false, assembly: false } },
  { id: "bag", name: "Taška / Pytel", category: "other", volume: 0.05, defaultServices: { disassembly: false, packing: false, assembly: false } },
  { id: "bicycle", name: "Kolo", category: "other", volume: 0.4, defaultServices: { disassembly: false, packing: false, assembly: false } },
  { id: "stroller", name: "Kočárek", category: "other", volume: 0.3, defaultServices: { disassembly: false, packing: false, assembly: false } },
  { id: "exercise-machine", name: "Posilovací stroj", category: "other", volume: 0.5, defaultServices: { disassembly: true, packing: false, assembly: true } },
  { id: "carpet-large", name: "Koberec (velký)", category: "other", volume: 0.2, defaultServices: { disassembly: false, packing: false, assembly: false } },
  { id: "piano", name: "Pianino / Klavír", category: "other", volume: 1.0, defaultServices: { disassembly: false, packing: true, assembly: false } },
]

export function getCatalogItem(id: string): CatalogItem | undefined {
  return CATALOG.find((item) => item.id === id)
}

export function getCatalogByCategory() {
  const grouped = new Map<string, CatalogItem[]>()
  for (const item of CATALOG) {
    const list = grouped.get(item.category) ?? []
    list.push(item)
    grouped.set(item.category, list)
  }
  return grouped
}

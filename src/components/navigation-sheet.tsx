"use client"

import { useState } from "react"
import { MapPin, Navigation2, X } from "lucide-react"

interface NavigationSheetProps {
  address: string
  onClose: () => void
}

const NAV_SERVICES = [
  {
    id: "apple",
    name: "Apple Maps",
    icon: "apple-maps",
    urlFn: (addr: string) => `maps://maps.apple.com/?q=${encodeURIComponent(addr)}`,
    platform: "ios",
  },
  {
    id: "google",
    name: "Google Maps",
    icon: "google-maps",
    urlFn: (addr: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`,
    platform: "all",
  },
  {
    id: "waze",
    name: "Waze",
    icon: "waze",
    urlFn: (addr: string) => `https://waze.com/ul?q=${encodeURIComponent(addr)}`,
    platform: "all",
  },
  {
    id: "mapy",
    name: "Mapy.cz",
    icon: "mapy",
    urlFn: (addr: string) => `https://mapy.cz/zakladni?q=${encodeURIComponent(addr)}`,
    platform: "all",
  },
]

export function NavigationSheet({ address, onClose }: NavigationSheetProps) {
  function handleSelect(urlFn: (addr: string) => string) {
    window.open(urlFn(address), "_blank")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center ios-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-t-2xl bg-card border-t border-border pb-[env(safe-area-inset-bottom)] ios-sheet-content">
        {/* Drag indicator */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="h-[5px] w-[36px] rounded-full bg-zinc-600" />
        </div>

        {/* Header */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              <span className="text-sm font-semibold">Navigovat</span>
            </div>
            <button type="button" onClick={onClose} aria-label="Zavřít" className="text-muted-foreground hover:text-foreground p-1">
              <X className="size-5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate">{address}</p>
        </div>

        {/* Navigation services */}
        <div className="flex flex-col divide-y divide-border">
          {NAV_SERVICES.map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => handleSelect(service.urlFn)}
              className="flex items-center gap-3 px-4 py-3.5 min-h-[52px] text-left hover:bg-accent active:bg-accent transition-colors"
            >
              <div className="flex items-center justify-center size-10 rounded-xl bg-muted">
                <Navigation2 className="size-5 text-foreground" />
              </div>
              <span className="text-sm font-medium">{service.name}</span>
            </button>
          ))}
        </div>

        {/* Cancel */}
        <div className="px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-muted py-3 text-sm font-medium text-foreground min-h-[44px] hover:bg-accent transition-colors"
          >
            Zrušit
          </button>
        </div>
      </div>
    </div>
  )
}

/** Hook pro otevření navigation sheetu */
export function useNavigationSheet() {
  const [navAddress, setNavAddress] = useState<string | null>(null)

  function openNav(address: string) {
    setNavAddress(address)
  }

  function closeNav() {
    setNavAddress(null)
  }

  return { navAddress, openNav, closeNav }
}

// SwiftUI: Form with grouped Sections
"use client"

import type { Job, JobType, JobAccess } from "@/lib/types"
import { JOB_TYPE_LABELS } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { Home, Building2, Weight, Palette, Globe, Navigation2, ChevronDown, ChevronUp } from "lucide-react"
import { NavigationSheet } from "@/components/navigation-sheet"

const JOB_TYPE_ICONS: Record<JobType, typeof Home> = {
  apartment: Home,
  office: Building2,
  heavy: Weight,
  art: Palette,
  international: Globe,
}

const JOB_TYPE_ORDER: JobType[] = ["apartment", "office", "heavy", "art", "international"]

/** @deprecated — use NavigationSheet instead */
function _openNavigation(address: string) {
  const encoded = encodeURIComponent(address)
  const ua = navigator.userAgent || ""
  if (/iPhone|iPad|iPod/.test(ua)) {
    window.location.href = `maps://maps.apple.com/?q=${encoded}`
  } else if (/Android/.test(ua)) {
    window.location.href = `geo:0,0?q=${encoded}`
  } else {
    window.open(`https://mapy.cz/zakladni?q=${encoded}`, "_blank")
  }
}

interface StepJobInfoProps {
  job: Job
  onChange: (updater: (prev: Job) => Job) => void
  onNext: () => void
  readonly?: boolean
}

export function StepJobInfo({ job, onChange, onNext, readonly }: StepJobInfoProps) {
  function updateClient(field: keyof Job["client"], value: string) {
    onChange((prev) => ({
      ...prev,
      client: { ...prev.client, [field]: value },
    }))
  }

  function updateLocation(
    loc: "pickup" | "delivery",
    field: string,
    value: string | number | boolean,
  ) {
    onChange((prev) => ({
      ...prev,
      [loc]: { ...prev[loc], [field]: value },
    }))
  }

  function updateAccess(field: keyof JobAccess, value: JobAccess[keyof JobAccess]) {
    onChange((prev) => ({
      ...prev,
      access: { ...prev.access, [field]: value },
    }))
  }

  const nextLabel = readonly ? "Pokracovat na pruzkum" : (job.mode === "quick" ? "Pokracovat na mistnosti" : "Pokracovat na inventar")

  if (readonly) {
    return (
      <ReadonlyJobInfo
        job={job}
        onChange={onChange}
        onNext={onNext}
        nextLabel={nextLabel}
        updateAccess={updateAccess}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Job type selector */}
      <section aria-labelledby="section-job-type">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle id="section-job-type" className="text-base">Typ zakazky</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {JOB_TYPE_ORDER.map((type) => {
                const Icon = JOB_TYPE_ICONS[type]
                const isActive = job.jobType === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onChange((prev) => ({ ...prev, jobType: type }))}
                    className={`flex shrink-0 flex-col items-center gap-1.5 rounded-lg border px-3 py-2.5 min-h-[44px] text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                      isActive
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="size-5" />
                    <span className="text-xs font-medium whitespace-nowrap">{JOB_TYPE_LABELS[type]}</span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="section-client">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle id="section-client" className="text-base">Klient</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FieldRow label="Jmeno">
            <Input
              value={job.client.name}
              onChange={(e) => updateClient("name", e.target.value)}
              placeholder="Jan Novak"
            />
          </FieldRow>
          <FieldRow label="Telefon">
            <Input
              type="tel"
              value={job.client.phone}
              onChange={(e) => updateClient("phone", e.target.value)}
              placeholder="+420 ..."
            />
          </FieldRow>
          <FieldRow label="Email">
            <Input
              type="email"
              value={job.client.email}
              onChange={(e) => updateClient("email", e.target.value)}
              placeholder="jan@example.cz"
            />
          </FieldRow>
        </CardContent>
      </Card>
      </section>

      {/* Nakladka */}
      <LocationCard
        title="Nakladka (odkud)"
        location={job.pickup}
        onChange={(field, value) => updateLocation("pickup", field, value)}
      />

      {/* Vykladka */}
      <LocationCard
        title="Vykladka (kam)"
        location={job.delivery}
        onChange={(field, value) => updateLocation("delivery", field, value)}
      />

      {/* Vzdalenost a termin */}
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <FieldRow label="Vzdalenost nakladka - vykladka (km)">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={job.distance || ""}
              onChange={(e) =>
                onChange((prev) => ({ ...prev, distance: Number(e.target.value) || 0 }))
              }
              placeholder="25"
            />
            <p className="text-xs text-muted-foreground mt-0.5">
              Centrala: U Pekarky 484/1a, Praha 8
            </p>
          </FieldRow>
          <FieldRow label="Termin stehovani">
            <Input
              type="date"
              value={job.date}
              onChange={(e) =>
                onChange((prev) => ({ ...prev, date: e.target.value }))
              }
            />
          </FieldRow>
        </CardContent>
      </Card>

      {/* Access & risks */}
      <AccessRisksCard access={job.access} onUpdate={updateAccess} />

      <div className="sticky bottom-0 bg-background/95 backdrop-blur py-4 -mx-4 px-4 border-t border-border mt-auto">
        <Button size="lg" className="h-14 w-full text-base" onClick={onNext}>
          {nextLabel} &rarr;
        </Button>
      </div>
    </div>
  )
}

/** Collapsible readonly view — optimized for field technician */
function ReadonlyJobInfo({ job, onChange, onNext, nextLabel, updateAccess }: {
  job: Job
  onChange: (updater: (prev: Job) => Job) => void
  onNext: () => void
  nextLabel: string
  updateAccess: (field: keyof JobAccess, value: JobAccess[keyof JobAccess]) => void
}) {
  const [crmExpanded, setCrmExpanded] = useState(false)
  const [accessExpanded, setAccessExpanded] = useState(false)

  // Build one-line summary: "Dvořák · Karlín → Modřany · 14 km"
  const pickupShort = job.pickup.address ? job.pickup.address.split(",")[0] : ""
  const deliveryShort = job.delivery.address ? job.delivery.address.split(",")[0] : ""
  const summaryParts = [
    job.client.name,
    pickupShort && deliveryShort ? `${pickupShort} \u2192 ${deliveryShort}` : pickupShort || deliveryShort,
    job.distance > 0 ? `${job.distance} km` : null,
  ].filter(Boolean)
  const summary = summaryParts.join(" \u00b7 ")

  return (
    <div className="flex flex-col gap-4">
      {/* CRM data — collapsed by default, one-line summary */}
      <button
        type="button"
        onClick={() => setCrmExpanded((prev) => !prev)}
        className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 min-h-[44px] w-full text-left transition-colors hover:bg-accent active:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span className="text-sm font-medium truncate flex-1 min-w-0">{summary}</span>
        {crmExpanded ? <ChevronUp className="size-4 text-muted-foreground shrink-0 ml-2" /> : <ChevronDown className="size-4 text-muted-foreground shrink-0 ml-2" />}
      </button>

      {crmExpanded && (
        <div className="rounded-2xl border border-border bg-muted/30 overflow-hidden divide-y divide-border">
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-xs text-muted-foreground">Klient</span>
            <span className="text-sm">{job.client.name}</span>
          </div>
          {job.client.phone && (
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-xs text-muted-foreground">Telefon</span>
              <span className="text-sm">{job.client.phone}</span>
            </div>
          )}
          {job.client.email && (
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-xs text-muted-foreground">Email</span>
              <span className="text-sm">{job.client.email}</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-2 px-4 py-2.5">
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span className="text-xs text-muted-foreground">Nakladka</span>
              <span className="text-sm">{job.pickup.address || "\u2014"}</span>
              <span className="text-xs text-muted-foreground/70">{job.pickup.floor}. patro{job.pickup.elevator ? " \u00b7 vytah" : " \u00b7 bez vytahu"}</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 px-4 py-2.5">
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span className="text-xs text-muted-foreground">Vykladka</span>
              <span className="text-sm">{job.delivery.address || "\u2014"}</span>
              <span className="text-xs text-muted-foreground/70">{job.delivery.floor}. patro{job.delivery.elevator ? " \u00b7 vytah" : " \u00b7 bez vytahu"}</span>
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-xs text-muted-foreground">Vzdalenost</span>
            <span className="text-sm font-mono">{job.distance} km</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-xs text-muted-foreground">Termin</span>
            <span className="text-sm">{job.date ? new Date(job.date).toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" }) : "\u2014"}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-xs text-muted-foreground">Typ</span>
            <span className="text-sm">{JOB_TYPE_LABELS[job.jobType]}</span>
          </div>
        </div>
      )}

      {/* Technician notes — always visible, this is the primary action */}
      <div className="rounded-2xl border border-border bg-card px-4 py-3">
        <span className="text-sm font-medium block mb-2">Poznamky technika</span>
        <textarea
          value={job.technicianNotes || ""}
          onChange={(e) => onChange((prev) => ({ ...prev, technicianNotes: e.target.value }))}
          placeholder="Vlastni poznamky k zakazce..."
          className="w-full min-h-[80px] rounded-lg border border-input bg-transparent px-2.5 py-2.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y"
        />
      </div>

      {/* Access & risks — collapsed by default */}
      <button
        type="button"
        onClick={() => setAccessExpanded((prev) => !prev)}
        className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 min-h-[44px] w-full text-left transition-colors hover:bg-accent active:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span className="text-sm font-medium">Pristup a rizika</span>
        {accessExpanded ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
      </button>

      {accessExpanded && (
        <AccessRisksCard access={job.access} onUpdate={updateAccess} />
      )}

      <div className="sticky bottom-0 bg-background/95 backdrop-blur py-4 -mx-4 px-4 border-t border-border mt-auto">
        <Button size="lg" className="h-14 w-full text-base" onClick={onNext}>
          {nextLabel} &rarr;
        </Button>
      </div>
    </div>
  )
}

/** Readonly data row */
function ReadonlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  )
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

/** Access & risks card */
function AccessRisksCard({ access, onUpdate }: {
  access: JobAccess
  onUpdate: (field: keyof JobAccess, value: JobAccess[keyof JobAccess]) => void
}) {
  const parkingOptions: { value: JobAccess["parking"]; label: string }[] = [
    { value: "easy", label: "Primo u domu" },
    { value: "limited", label: "Omezene" },
    { value: "difficult", label: "Nutno resit" },
  ]

  const entryOptions: { value: JobAccess["entryDistance"]; label: string }[] = [
    { value: "short", label: "Kratka" },
    { value: "medium", label: "Stredni" },
    { value: "long", label: "Dlouha" },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Pristup a rizika</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {/* Parking */}
        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">Parkovani</span>
          <div className="flex gap-2">
            {parkingOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onUpdate("parking", opt.value)}
                className={`flex-1 rounded-lg border px-2 py-2.5 text-xs font-medium min-h-[44px] text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  access.parking === opt.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Narrow passage */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between min-h-[44px]">
            <span className="text-sm text-muted-foreground">Uzky pruchod</span>
            <Switch
              checked={access.narrowPassage}
              onCheckedChange={(checked: boolean) => onUpdate("narrowPassage", checked)}
              aria-label="Uzky pruchod"
            />
          </div>
          {access.narrowPassage && (
            <Input
              value={access.narrowNote}
              onChange={(e) => onUpdate("narrowNote", e.target.value)}
              placeholder="Poznamka k pruchodu..."
            />
          )}
        </div>

        {/* Entry distance */}
        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">Vzdalenost ke vchodu</span>
          <div className="flex gap-2">
            {entryOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onUpdate("entryDistance", opt.value)}
                className={`flex-1 rounded-lg border px-2 py-2.5 text-xs font-medium min-h-[44px] text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  access.entryDistance === opt.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function LocationCard({
  title,
  location,
  onChange,
}: {
  title: string
  location: { address: string; floor: number; elevator: boolean }
  onChange: (field: string, value: string | number | boolean) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm text-muted-foreground">Adresa</span>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                value={location.address}
                onChange={(e) => onChange("address", e.target.value)}
                placeholder="Ulice 123, Praha"
              />
            </div>
            {location.address && (
              <button
                type="button"
                onClick={() => _openNavigation(location.address)}
                className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-primary shrink-0 min-h-[44px] hover:bg-accent active:bg-accent transition-colors"
              >
                <Navigation2 className="size-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <FieldRow label="Patro">
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                max={30}
                value={location.floor || ""}
                onChange={(e) => onChange("floor", Number(e.target.value) || 0)}
                placeholder="0"
              />
            </FieldRow>
          </div>
          <div className="flex items-end gap-2 pb-0.5">
            <Switch
              id={`elevator-${title}`}
              checked={location.elevator}
              onCheckedChange={(checked: boolean) => onChange("elevator", checked)}
              aria-label="Vytah"
            />
            <Label htmlFor={`elevator-${title}`} className="text-sm">Vytah</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// SwiftUI: Form with grouped Sections
"use client"

import type { Job, JobType } from "@/lib/types"
import { JOB_TYPE_LABELS } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Building2, Weight, Palette, Globe } from "lucide-react"

const JOB_TYPE_ICONS: Record<JobType, typeof Home> = {
  apartment: Home,
  office: Building2,
  heavy: Weight,
  art: Palette,
  international: Globe,
}

const JOB_TYPE_ORDER: JobType[] = ["apartment", "office", "heavy", "art", "international"]

interface StepJobInfoProps {
  job: Job
  onChange: (updater: (prev: Job) => Job) => void
  onNext: () => void
}

export function StepJobInfo({ job, onChange, onNext }: StepJobInfoProps) {
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

  return (
    <div className="flex flex-col gap-6">
      {/* Job type selector */}
      <section aria-labelledby="section-job-type">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle id="section-job-type" className="text-base">Typ zakázky</CardTitle>
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
          <FieldRow label="Jméno">
            <Input
              value={job.client.name}
              onChange={(e) => updateClient("name", e.target.value)}
              placeholder="Jan Novák"
            />
          </FieldRow>
          <FieldRow label="Telefon">
            <Input
              type="tel"
              value={job.client.phone}
              onChange={(e) => updateClient("phone", e.target.value)}
              placeholder="+420 …"
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

      {/* Nakládka */}
      <LocationCard
        title="Nakládka (odkud)"
        location={job.pickup}
        onChange={(field, value) => updateLocation("pickup", field, value)}
      />

      {/* Vykládka */}
      <LocationCard
        title="Vykládka (kam)"
        location={job.delivery}
        onChange={(field, value) => updateLocation("delivery", field, value)}
      />

      {/* Vzdálenost a termín */}
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <FieldRow label="Vzdálenost nakládka → vykládka (km)">
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
              Centrála: U Pekařky 484/1a, Praha 8
            </p>
          </FieldRow>
          <FieldRow label="Termín stěhování">
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

      <div className="sticky bottom-0 bg-background/95 backdrop-blur py-4 -mx-4 px-4 border-t border-border mt-auto">
        <Button size="lg" className="h-14 w-full text-base" onClick={onNext}>
          Pokračovat na inventář →
        </Button>
      </div>
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
        <FieldRow label="Adresa">
          <Input
            value={location.address}
            onChange={(e) => onChange("address", e.target.value)}
            placeholder="Ulice 123, Praha"
          />
        </FieldRow>
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
              onCheckedChange={(checked) => onChange("elevator", checked)}
              aria-label="Výtah"
            />
            <Label htmlFor={`elevator-${title}`} className="text-sm">Výtah</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

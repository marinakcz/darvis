"use client"

import type { Job } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
      {/* Klient */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Klient</CardTitle>
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
          <FieldRow label="Vzdálenost (km)">
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

      <Button size="lg" className="h-14 text-base" onClick={onNext}>
        Pokračovat na inventář →
      </Button>
    </div>
  )
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      {children}
    </div>
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
              checked={location.elevator}
              onCheckedChange={(checked) => onChange("elevator", checked)}
            />
            <Label className="text-sm">Výtah</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

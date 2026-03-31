import { logJobEvent, getJobEvents, type JobEventType } from "@/lib/db/events"

export const dynamic = "force-dynamic"

const ALLOWED_TYPES: JobEventType[] = [
  "call_logged",
  "note_added",
  "reminder_set",
]

/** GET /api/jobs/[id]/events — timeline pro CRM cockpit */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const events = await getJobEvents(id)
  return Response.json(events)
}

/** POST /api/jobs/[id]/events — ruční CRM akce (hovor, poznámka, reminder) */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await request.json()

  const { type, note, reminderDate } = body as {
    type: string
    note?: string
    reminderDate?: string
  }

  if (!type || !ALLOWED_TYPES.includes(type as JobEventType)) {
    return Response.json(
      { error: `Invalid type. Allowed: ${ALLOWED_TYPES.join(", ")}` },
      { status: 400 },
    )
  }

  const payload: Record<string, unknown> = {}
  if (note) payload.note = note
  if (reminderDate) payload.reminderDate = reminderDate

  await logJobEvent(id, type, payload)

  return Response.json({ ok: true }, { status: 201 })
}

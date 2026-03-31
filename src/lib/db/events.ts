import { db } from "."
import { jobEvents } from "./schema"
import { eq, desc } from "drizzle-orm"

/* ── Event typy ── */

export const JOB_EVENT_TYPES = [
  // Systémové
  "job_created",
  "job_updated",
  "survey_saved",
  "offer_generated",
  "offer_viewed",
  // CRM ruční akce
  "status_changed",
  "call_logged",
  "note_added",
  "reminder_set",
] as const

export type JobEventType = (typeof JOB_EVENT_TYPES)[number]

/* ── Logování ── */

/** Append an event to the job event log */
export async function logJobEvent(
  jobId: string,
  type: string,
  payload?: Record<string, unknown>,
) {
  await db.insert(jobEvents).values({ jobId, type, payload: payload ?? {} })
}

/** Get events for a job, newest first */
export async function getJobEvents(jobId: string) {
  return db
    .select()
    .from(jobEvents)
    .where(eq(jobEvents.jobId, jobId))
    .orderBy(desc(jobEvents.createdAt))
}

import { db } from "."
import { jobEvents } from "./schema"

/** Append an event to the job event log */
export async function logJobEvent(
  jobId: string,
  type: string,
  payload?: Record<string, unknown>,
) {
  await db.insert(jobEvents).values({ jobId, type, payload: payload ?? {} })
}

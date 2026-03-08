import { eq } from "drizzle-orm";

import { settings } from "@/db/schema";
import { getUserDb } from "@/db/userDb";

const SETUP_COMPLETED_KEY = "setupCompleted";

export function getSetupCompleted(userId: string): boolean {
  const [row] = getUserDb(userId).select(settings, eq(settings.key, SETUP_COMPLETED_KEY)).all();
  return row?.value === "true";
}

export function setSetupCompleted(userId: string, completed: boolean) {
  getUserDb(userId)
    .insert(settings, { key: SETUP_COMPLETED_KEY, value: String(completed) })
    .onConflictDoUpdate({
      target: [settings.userId, settings.key],
      set: { value: String(completed) },
    })
    .run();
}

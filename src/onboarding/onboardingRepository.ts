import { eq } from "drizzle-orm";

import { settings } from "@/db/schema";
import { getDb } from "@/db/userDb";

const SETUP_COMPLETED_KEY = "setupCompleted";

export async function getSetupCompleted(): Promise<boolean> {
  const [row] = (await getDb()).select(settings, eq(settings.key, SETUP_COMPLETED_KEY)).all();
  return row?.value === "true";
}

export async function setSetupCompleted(completed: boolean) {
  (await getDb())
    .insert(settings, { key: SETUP_COMPLETED_KEY, value: String(completed) })
    .onConflictDoUpdate({
      target: [settings.userId, settings.key],
      set: { value: String(completed) },
    })
    .run();
}

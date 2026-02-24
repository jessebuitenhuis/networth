import { eq } from "drizzle-orm";

import { db } from "@/db/connection";
import { settings } from "@/db/schema";

const SETUP_COMPLETED_KEY = "setupCompleted";

export function getSetupCompleted(): boolean {
  const rows = db
    .select()
    .from(settings)
    .where(eq(settings.key, SETUP_COMPLETED_KEY))
    .all();

  return rows[0]?.value === "true";
}

export function setSetupCompleted(completed: boolean) {
  db.insert(settings)
    .values({ key: SETUP_COMPLETED_KEY, value: String(completed) })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: String(completed) },
    })
    .run();
}

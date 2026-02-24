import { and, eq } from "drizzle-orm";

import { db } from "@/db/connection";
import { scenarios, settings } from "@/db/schema";
import { generateId } from "@/lib/generateId";
import { getCurrentUserId } from "@/lib/getCurrentUserId";

export function getAllScenarios() {
  const userId = getCurrentUserId();
  return db.select().from(scenarios).where(eq(scenarios.userId, userId)).all();
}

export function getScenarioById(id: string) {
  const userId = getCurrentUserId();
  const [row] = db
    .select()
    .from(scenarios)
    .where(and(eq(scenarios.id, id), eq(scenarios.userId, userId)))
    .all();
  return row;
}

export function createScenario({ id, name, inflationRate }: { id: string; name: string; inflationRate?: number }) {
  const userId = getCurrentUserId();
  db.insert(scenarios).values({ id, userId, name, inflationRate: inflationRate ?? null }).run();

  return getScenarioById(id)!;
}

export function updateScenario(id: string, { name, inflationRate }: { name: string; inflationRate?: number }) {
  const userId = getCurrentUserId();
  db.update(scenarios)
    .set({ name, inflationRate: inflationRate ?? null })
    .where(and(eq(scenarios.id, id), eq(scenarios.userId, userId)))
    .run();

  return getScenarioById(id)!;
}

export function deleteScenario(id: string) {
  const userId = getCurrentUserId();
  db.delete(scenarios)
    .where(and(eq(scenarios.id, id), eq(scenarios.userId, userId)))
    .run();
}

export function getActiveScenarioId() {
  const userId = getCurrentUserId();
  const rows = db
    .select()
    .from(settings)
    .where(and(eq(settings.key, "activeScenarioId"), eq(settings.userId, userId)))
    .all();

  return rows[0]?.value ?? null;
}

export function setActiveScenarioId(scenarioId: string) {
  const userId = getCurrentUserId();
  db.insert(settings)
    .values({ userId, key: "activeScenarioId", value: scenarioId })
    .onConflictDoUpdate({
      target: [settings.userId, settings.key],
      set: { value: scenarioId },
    })
    .run();
}

export function ensureBasePlanExists() {
  const userId = getCurrentUserId();
  const rows = getAllScenarios();

  if (rows.length === 0) {
    const id = generateId();
    db.insert(scenarios).values({ id, userId, name: "Base Plan" }).run();
    setActiveScenarioId(id);
  }
}

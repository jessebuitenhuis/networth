import { eq } from "drizzle-orm";

import { scenarios, settings } from "@/db/schema";
import { getUserDb } from "@/db/userDb";
import { generateId } from "@/lib/generateId";

export function getAllScenarios(userId: string) {
  return getUserDb(userId).select(scenarios).all();
}

export function getScenarioById(userId: string, id: string) {
  const [row] = getUserDb(userId).select(scenarios, eq(scenarios.id, id)).all();
  return row;
}

export function createScenario(userId: string, { id, name, inflationRate }: { id: string; name: string; inflationRate?: number }) {
  getUserDb(userId).insert(scenarios, { id, name, inflationRate: inflationRate ?? null }).run();
  return getScenarioById(userId, id)!;
}

export function updateScenario(userId: string, id: string, { name, inflationRate }: { name: string; inflationRate?: number }) {
  getUserDb(userId).update(scenarios, { name, inflationRate: inflationRate ?? null }, eq(scenarios.id, id)).run();
  return getScenarioById(userId, id)!;
}

export function deleteScenario(userId: string, id: string) {
  getUserDb(userId).delete(scenarios, eq(scenarios.id, id)).run();
}

export function getActiveScenarioId(userId: string) {
  const [row] = getUserDb(userId).select(settings, eq(settings.key, "activeScenarioId")).all();
  return row?.value ?? null;
}

export function setActiveScenarioId(userId: string, scenarioId: string) {
  getUserDb(userId)
    .insert(settings, { key: "activeScenarioId", value: scenarioId })
    .onConflictDoUpdate({
      target: [settings.userId, settings.key],
      set: { value: scenarioId },
    })
    .run();
}

export function ensureBasePlanExists(userId: string) {
  const rows = getAllScenarios(userId);
  if (rows.length === 0) {
    const id = generateId();
    getUserDb(userId).insert(scenarios, { id, name: "Base Plan" }).run();
    setActiveScenarioId(userId, id);
  }
}

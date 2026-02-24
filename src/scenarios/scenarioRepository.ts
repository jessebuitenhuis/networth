import { eq } from "drizzle-orm";

import { getUserDb } from "@/db/userDb";
import { scenarios, settings } from "@/db/schema";
import { generateId } from "@/lib/generateId";

export function getAllScenarios() {
  return getUserDb().select(scenarios).all();
}

export function getScenarioById(id: string) {
  const [row] = getUserDb().select(scenarios, eq(scenarios.id, id)).all();
  return row;
}

export function createScenario({ id, name, inflationRate }: { id: string; name: string; inflationRate?: number }) {
  getUserDb().insert(scenarios, { id, name, inflationRate: inflationRate ?? null }).run();
  return getScenarioById(id)!;
}

export function updateScenario(id: string, { name, inflationRate }: { name: string; inflationRate?: number }) {
  getUserDb().update(scenarios, { name, inflationRate: inflationRate ?? null }, eq(scenarios.id, id)).run();
  return getScenarioById(id)!;
}

export function deleteScenario(id: string) {
  getUserDb().delete(scenarios, eq(scenarios.id, id)).run();
}

export function getActiveScenarioId() {
  const [row] = getUserDb().select(settings, eq(settings.key, "activeScenarioId")).all();
  return row?.value ?? null;
}

export function setActiveScenarioId(scenarioId: string) {
  getUserDb()
    .insert(settings, { key: "activeScenarioId", value: scenarioId })
    .onConflictDoUpdate({
      target: [settings.userId, settings.key],
      set: { value: scenarioId },
    })
    .run();
}

export function ensureBasePlanExists() {
  const rows = getAllScenarios();
  if (rows.length === 0) {
    const id = generateId();
    getUserDb().insert(scenarios, { id, name: "Base Plan" }).run();
    setActiveScenarioId(id);
  }
}

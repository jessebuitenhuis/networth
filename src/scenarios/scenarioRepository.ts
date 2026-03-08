import { eq } from "drizzle-orm";

import { scenarios, settings } from "@/db/schema";
import { getDb } from "@/db/userDb";
import { generateId } from "@/lib/generateId";

export async function getAllScenarios() {
  return (await getDb()).select(scenarios).all();
}

export async function getScenarioById(id: string) {
  const [row] = (await getDb()).select(scenarios, eq(scenarios.id, id)).all();
  return row;
}

export async function createScenario({ id, name, inflationRate }: { id: string; name: string; inflationRate?: number }) {
  (await getDb()).insert(scenarios, { id, name, inflationRate: inflationRate ?? null }).run();
  return (await getScenarioById(id))!;
}

export async function updateScenario(id: string, { name, inflationRate }: { name: string; inflationRate?: number }) {
  (await getDb()).update(scenarios, { name, inflationRate: inflationRate ?? null }, eq(scenarios.id, id)).run();
  return (await getScenarioById(id))!;
}

export async function deleteScenario(id: string) {
  (await getDb()).delete(scenarios, eq(scenarios.id, id)).run();
}

export async function getActiveScenarioId() {
  const [row] = (await getDb()).select(settings, eq(settings.key, "activeScenarioId")).all();
  return row?.value ?? null;
}

export async function setActiveScenarioId(scenarioId: string) {
  (await getDb())
    .insert(settings, { key: "activeScenarioId", value: scenarioId })
    .onConflictDoUpdate({
      target: [settings.userId, settings.key],
      set: { value: scenarioId },
    })
    .run();
}

export async function ensureBasePlanExists() {
  const rows = await getAllScenarios();
  if (rows.length === 0) {
    const id = generateId();
    (await getDb()).insert(scenarios, { id, name: "Base Plan" }).run();
    await setActiveScenarioId(id);
  }
}

import { eq } from "drizzle-orm";

import { scenarios, settings } from "@/db/schema";
import { getUserDb } from "@/db/userDb";
import { generateId } from "@/lib/generateId";

export async function getAllScenarios() {
  return (await getUserDb()).select(scenarios).all();
}

export async function getScenarioById(id: string) {
  const [row] = (await getUserDb()).select(scenarios, eq(scenarios.id, id)).all();
  return row;
}

export async function createScenario({ id, name, inflationRate }: { id: string; name: string; inflationRate?: number }) {
  (await getUserDb()).insert(scenarios, { id, name, inflationRate: inflationRate ?? null }).run();
  return (await getScenarioById(id))!;
}

export async function updateScenario(id: string, { name, inflationRate }: { name: string; inflationRate?: number }) {
  (await getUserDb()).update(scenarios, { name, inflationRate: inflationRate ?? null }, eq(scenarios.id, id)).run();
  return (await getScenarioById(id))!;
}

export async function deleteScenario(id: string) {
  (await getUserDb()).delete(scenarios, eq(scenarios.id, id)).run();
}

export async function getActiveScenarioId() {
  const [row] = (await getUserDb()).select(settings, eq(settings.key, "activeScenarioId")).all();
  return row?.value ?? null;
}

export async function setActiveScenarioId(scenarioId: string) {
  (await getUserDb())
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
    (await getUserDb()).insert(scenarios, { id, name: "Base Plan" }).run();
    await setActiveScenarioId(id);
  }
}

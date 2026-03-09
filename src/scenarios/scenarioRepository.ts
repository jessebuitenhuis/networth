import { eq } from "drizzle-orm";

import { scenarios, settings } from "@/db/schema";
import { getDb } from "@/db/userDb";
import { generateId } from "@/lib/generateId";

export async function getAllScenarios() {
  return (await getDb()).select(scenarios);
}

export async function getScenarioById(id: string) {
  const [row] = await (await getDb()).select(scenarios, eq(scenarios.id, id));
  return row;
}

export async function createScenario({ id, name, inflationRate }: { id: string; name: string; inflationRate?: number }) {
  await (await getDb()).insert(scenarios, { id, name, inflationRate: inflationRate ?? null });
  return (await getScenarioById(id))!;
}

export async function updateScenario(id: string, { name, inflationRate }: { name: string; inflationRate?: number }) {
  await (await getDb()).update(scenarios, { name, inflationRate: inflationRate ?? null }, eq(scenarios.id, id));
  return (await getScenarioById(id))!;
}

export async function deleteScenario(id: string) {
  await (await getDb()).delete(scenarios, eq(scenarios.id, id));
}

export async function getActiveScenarioId() {
  const [row] = await (await getDb()).select(settings, eq(settings.key, "activeScenarioId"));
  return row?.value ?? null;
}

export async function setActiveScenarioId(scenarioId: string) {
  await (await getDb())
    .insert(settings, { key: "activeScenarioId", value: scenarioId })
    .onConflictDoUpdate({
      target: [settings.userId, settings.key],
      set: { value: scenarioId },
    });
}

export async function ensureBasePlanExists() {
  const rows = await getAllScenarios();
  if (rows.length === 0) {
    const id = generateId();
    await (await getDb()).insert(scenarios, { id, name: "Base Plan" });
    await setActiveScenarioId(id);
  }
}

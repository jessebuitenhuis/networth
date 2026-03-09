import { eq } from "drizzle-orm";

import { BaseRepository } from "@/db/BaseRepository";
import { scenarios, settings } from "@/db/schema";
import { getDb } from "@/db/userDb";
import { generateId } from "@/lib/generateId";

class ScenarioRepository extends BaseRepository<typeof scenarios> {
  constructor() {
    super(scenarios, scenarios.id);
  }

  async createScenario({ id, name, inflationRate }: { id: string; name: string; inflationRate?: number }) {
    return this.create({ id, name, inflationRate: inflationRate ?? null });
  }

  async updateScenario(id: string, { name, inflationRate }: { name: string; inflationRate?: number }) {
    return this.update(id, { name, inflationRate: inflationRate ?? null });
  }
}

export const scenarioRepo = new ScenarioRepository();

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
  const rows = await scenarioRepo.getAll();
  if (rows.length === 0) {
    const id = generateId();
    await (await getDb()).insert(scenarios, { id, name: "Base Plan" });
    await setActiveScenarioId(id);
  }
}

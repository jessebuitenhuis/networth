import { eq } from "drizzle-orm";

import { db } from "@/db/connection";
import { scenarios, settings } from "@/db/schema";
import { generateId } from "@/lib/generateId";

export function getAllScenarios() {
  return db.select().from(scenarios).all();
}

export function getScenarioById(id: string) {
  const [row] = db
    .select()
    .from(scenarios)
    .where(eq(scenarios.id, id))
    .all();
  return row;
}

export function createScenario({ id, name }: { id: string; name: string }) {
  db.insert(scenarios).values({ id, name }).run();

  return getScenarioById(id)!;
}

export function updateScenario(id: string, { name }: { name: string }) {
  db.update(scenarios)
    .set({ name })
    .where(eq(scenarios.id, id))
    .run();

  return getScenarioById(id)!;
}

export function deleteScenario(id: string) {
  db.delete(scenarios).where(eq(scenarios.id, id)).run();
}

export function getActiveScenarioId() {
  const rows = db
    .select()
    .from(settings)
    .where(eq(settings.key, "activeScenarioId"))
    .all();

  return rows[0]?.value ?? null;
}

export function setActiveScenarioId(scenarioId: string) {
  db.insert(settings)
    .values({ key: "activeScenarioId", value: scenarioId })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: scenarioId },
    })
    .run();
}

export function ensureBasePlanExists() {
  const rows = getAllScenarios();

  if (rows.length === 0) {
    const id = generateId();
    db.insert(scenarios).values({ id, name: "Base Plan" }).run();
    setActiveScenarioId(id);
  }
}

import type { Scenario } from "@/models/Scenario.type";

const SCENARIOS_KEY = "scenarios";
const ACTIVE_SCENARIO_ID_KEY = "activeScenarioId";

export function loadScenarios(): Scenario[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(SCENARIOS_KEY);
    if (!data) return [];

    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];

    return parsed;
  } catch {
    return [];
  }
}

export function saveScenarios(scenarios: Scenario[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SCENARIOS_KEY, JSON.stringify(scenarios));
}

export function loadActiveScenarioId(): string | null {
  if (typeof window === "undefined") return null;
  const id = localStorage.getItem(ACTIVE_SCENARIO_ID_KEY);
  return id && id.length > 0 ? id : null;
}

export function saveActiveScenarioId(id: string | null): void {
  if (typeof window === "undefined") return;
  if (id === null) {
    localStorage.removeItem(ACTIVE_SCENARIO_ID_KEY);
  } else {
    localStorage.setItem(ACTIVE_SCENARIO_ID_KEY, id);
  }
}

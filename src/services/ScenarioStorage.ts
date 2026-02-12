import type { Scenario } from "@/models/Scenario.type";

const SCENARIOS_KEY = "scenarios";
const ACTIVE_SCENARIO_ID_KEY = "activeScenarioId";

export class ScenarioStorage {
  static loadScenarios(): Scenario[] {
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

  static saveScenarios(scenarios: Scenario[]): void {
    localStorage.setItem(SCENARIOS_KEY, JSON.stringify(scenarios));
  }

  static loadActiveScenarioId(): string | null {
    const id = localStorage.getItem(ACTIVE_SCENARIO_ID_KEY);
    return id && id.length > 0 ? id : null;
  }

  static saveActiveScenarioId(id: string | null): void {
    if (id === null) {
      localStorage.removeItem(ACTIVE_SCENARIO_ID_KEY);
    } else {
      localStorage.setItem(ACTIVE_SCENARIO_ID_KEY, id);
    }
  }
}

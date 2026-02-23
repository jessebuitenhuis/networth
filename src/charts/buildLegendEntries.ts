import { getGoalColor, getScenarioColor } from "@/charts/chartColors";
import type { Goal } from "@/goals/Goal.type";
import type { Scenario } from "@/scenarios/Scenario.type";

export function buildLegendEntries(
  selectedScenarioIds: Set<string>,
  scenarios: Scenario[],
  goals: Goal[]
) {
  return [
    { name: "Baseline", color: "var(--color-primary)", lineStyle: "solid" as const },
    ...Array.from(selectedScenarioIds).map((scenarioId) => {
      const scenario = scenarios.find((s) => s.id === scenarioId);
      const scenarioIndex = scenarios.findIndex((s) => s.id === scenarioId);
      return {
        name: scenario?.name || scenarioId,
        color: getScenarioColor(scenarioIndex),
        lineStyle: "dashed" as const,
      };
    }),
    ...goals.map((goal, i) => ({
      name: goal.name,
      color: getGoalColor(i),
      lineStyle: "dotted" as const,
    })),
  ];
}

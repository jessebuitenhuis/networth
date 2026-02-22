import type { GoalAchievement } from "./GoalAchievement.type";

export type ScenarioComparisonMetrics = {
  scenarioId: string | null;
  scenarioName: string;
  projectedNetWorth1yr: number;
  projectedNetWorth5yr: number;
  projectedNetWorth10yr: number;
  goalAchievements: GoalAchievement[];
  totalIncome: number;
  totalExpenses: number;
};

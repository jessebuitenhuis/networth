export type GoalAchievement = {
  goalId: string;
  goalName: string;
  achievementDate: string | null;
};

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

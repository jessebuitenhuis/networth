import type { NetWorthDataPoint } from "@/charts/NetWorthDataPoint.type";
import type { Goal } from "@/goals/Goal.type";

import type { GoalAchievement } from "./GoalAchievement.type";

export function computeGoalAchievements(
  goals: Goal[],
  projectedSeries: NetWorthDataPoint[]
): GoalAchievement[] {
  return goals.map((goal) => {
    if (goal.targetAmount <= 0) {
      return { goalId: goal.id, goalName: goal.name, achievementDate: null };
    }
    const achievementPoint = projectedSeries.find(
      (point) => point.netWorth >= goal.targetAmount
    );
    return {
      goalId: goal.id,
      goalName: goal.name,
      achievementDate: achievementPoint?.date ?? null,
    };
  });
}

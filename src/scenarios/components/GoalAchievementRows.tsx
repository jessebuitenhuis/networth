import type { Goal } from "@/goals/Goal.type";
import type { ScenarioComparisonMetrics } from "@/scenarios/ScenarioComparisonMetrics.type";

import { ComparisonRow } from "./ComparisonRow";
import { ComparisonSectionHeader } from "./ComparisonSectionHeader";
import { formatAchievementDate } from "./formatAchievementDate";

function findAchievementDate(
  col: ScenarioComparisonMetrics,
  goalId: string
): string | null {
  return (
    col.goalAchievements.find((ga) => ga.goalId === goalId)
      ?.achievementDate ?? null
  );
}

export function GoalAchievementRows({
  columns,
  goals,
}: {
  columns: ScenarioComparisonMetrics[];
  goals: Goal[];
}) {
  return (
    <>
      <ComparisonSectionHeader
        label="Goal Achievement"
        columnCount={columns.length}
      />
      {goals.map((goal) => (
        <ComparisonRow
          key={goal.id}
          label={goal.name}
          columns={columns}
          renderValue={(col) =>
            formatAchievementDate(findAchievementDate(col, goal.id))
          }
        />
      ))}
    </>
  );
}

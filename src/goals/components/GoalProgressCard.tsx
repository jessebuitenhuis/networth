import type { CSSProperties } from "react";

import { getGoalColor } from "@/charts/chartColors";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { GoalProgress } from "@/goals/GoalProgress.type";

type GoalProgressCardProps = {
  progress: GoalProgress;
  colorIndex: number;
};

export function GoalProgressCard({ progress, colorIndex }: GoalProgressCardProps) {
  const color = getGoalColor(colorIndex);
  const vars = { "--goal-color": color } as CSSProperties;

  return (
    <Card className="overflow-hidden" style={vars}>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="goal-dot size-2 rounded-full" />
          <h3 className="goal-name text-sm font-semibold">
            {progress.goalName}
          </h3>
        </div>
        <Progress
          value={progress.percentage}
          aria-valuenow={progress.percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="font-medium">{progress.percentage}% complete</span>
          <span>{progress.timeEstimate}</span>
        </div>
      </CardContent>
    </Card>
  );
}

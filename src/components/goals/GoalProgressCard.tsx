import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getGoalColor } from "@/lib/chartColors";
import type { GoalProgress } from "@/models/GoalProgress.type";

type GoalProgressCardProps = {
  progress: GoalProgress;
  colorIndex: number;
};

export function GoalProgressCard({ progress, colorIndex }: GoalProgressCardProps) {
  const color = getGoalColor(colorIndex);

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold" style={{ color }}>
          {progress.goalName}
        </h3>
        <Progress
          value={progress.percentage}
          aria-valuenow={progress.percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{progress.percentage}% complete</span>
          <span>{progress.timeEstimate}</span>
        </div>
      </CardContent>
    </Card>
  );
}

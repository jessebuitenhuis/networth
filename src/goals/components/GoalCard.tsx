import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Goal } from "@/goals/Goal.type";
import { formatCurrency } from "@/lib/formatCurrency";

type GoalCardProps = {
  goal: Goal;
  editAction: React.ReactNode;
};

export function GoalCard({ goal, editAction }: GoalCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-semibold">{goal.name}</h3>
        {editAction}
      </CardHeader>
      <CardContent>
        <div className="font-display text-2xl text-gold">
          {formatCurrency(goal.targetAmount)}
        </div>
      </CardContent>
    </Card>
  );
}

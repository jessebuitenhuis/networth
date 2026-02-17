"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useGoals } from "@/goals/GoalContext";

import { EditGoalDialog } from "./EditGoalDialog";
import { GoalCard } from "./GoalCard";

export function GoalList() {
  const { goals } = useGoals();

  if (goals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No goals yet. Add a goal to start tracking your financial targets.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          editAction={<EditGoalDialog goal={goal} />}
        />
      ))}
    </div>
  );
}

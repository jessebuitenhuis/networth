"use client";

import TopBar from "@/components/layout/TopBar";
import { CreateGoalDialog } from "@/goals/components/CreateGoalDialog";
import { GoalList } from "@/goals/components/GoalList";
import { useGoals } from "@/goals/GoalContext";

export default function GoalsPage() {
  const { goals } = useGoals();

  return (
    <>
      <TopBar title="Goals" actions={<CreateGoalDialog />} />
      <div className="flex justify-center p-6">
        <div className="w-full max-w-2xl">
          <GoalList goals={goals} />
        </div>
      </div>
    </>
  );
}

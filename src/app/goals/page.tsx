"use client";

import TopBar from "@/components/layout/TopBar";
import { CreateGoalDialog } from "@/goals/components/CreateGoalDialog";
import { GoalList } from "@/goals/components/GoalList";

export default function GoalsPage() {
  return (
    <>
      <TopBar title="Goals" actions={<CreateGoalDialog />} />
      <div className="flex justify-center p-4">
        <div className="w-full max-w-2xl">
          <GoalList />
        </div>
      </div>
    </>
  );
}

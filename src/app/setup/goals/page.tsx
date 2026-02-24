"use client";

import { GoalStep } from "@/onboarding/components/GoalStep";
import { useWizard } from "@/onboarding/WizardContext";

export default function GoalsPage() {
  const wizard = useWizard();

  return <GoalStep goal={wizard.data.goal} onSetGoal={wizard.setGoal} />;
}

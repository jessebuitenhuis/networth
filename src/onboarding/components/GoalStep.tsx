import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { WizardGoalEntry } from "../WizardGoalEntry.type";

type GoalStepProps = {
  goal: WizardGoalEntry | null;
  onSetGoal: (goal: WizardGoalEntry | null) => void;
};

export function GoalStep({ goal, onSetGoal }: GoalStepProps) {
  function handleNameChange(name: string) {
    onSetGoal({ name, targetAmount: goal?.targetAmount ?? 0 });
  }

  function handleAmountChange(targetAmount: number) {
    onSetGoal({ name: goal?.name ?? "", targetAmount });
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="goal-name" className="mb-2">
          Goal name
        </Label>
        <Input
          id="goal-name"
          value={goal?.name ?? ""}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g. Retirement, House Down Payment"
        />
      </div>
      <div>
        <Label htmlFor="goal-target" className="mb-2">
          Target amount
        </Label>
        <CurrencyInput
          id="goal-target"
          value={goal?.targetAmount ?? 0}
          onChange={handleAmountChange}
          aria-label="Target amount"
          showSignToggle={false}
        />
      </div>
    </div>
  );
}

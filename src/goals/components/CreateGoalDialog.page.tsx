import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Goal } from "@/goals/Goal.type";
import { GoalProvider, useGoals } from "@/goals/GoalContext";

import { CreateGoalDialog } from "./CreateGoalDialog";

function TestHarness() {
  const { goals } = useGoals();
  return (
    <div>
      <CreateGoalDialog />
      <ul data-testid="goals">
        {goals.map((g: Goal) => (
          <li key={g.id}>
            {g.name} - {g.targetAmount}
          </li>
        ))}
      </ul>
    </div>
  );
}

export class CreateGoalDialogPage {
  private constructor(private _user: ReturnType<typeof userEvent.setup>) {}

  static render() {
    const user = userEvent.setup();
    render(
      <GoalProvider>
        <TestHarness />
      </GoalProvider>
    );
    return new CreateGoalDialogPage(user);
  }

  get triggerButton() {
    return screen.getByRole("button", { name: /add goal/i });
  }

  get dialog() {
    return screen.getByRole("dialog");
  }

  queryDialog() {
    return screen.queryByRole("dialog");
  }

  get nameInput() {
    return screen.getByLabelText("Name");
  }

  get targetAmountInput() {
    return screen.getByLabelText("Target Amount");
  }

  get submitButton() {
    return screen.getByRole("button", { name: /add goal$/i });
  }

  get goalsList() {
    return screen.getByTestId("goals");
  }

  async open() {
    await this._user.click(this.triggerButton);
    return this;
  }

  async fillName(name: string) {
    await this._user.type(this.nameInput, name);
    return this;
  }

  async fillTargetAmount(amount: string) {
    const input = this.targetAmountInput;
    await this._user.clear(input);
    await this._user.type(input, amount);
    return this;
  }

  async submit() {
    await this._user.click(this.submitButton);
    return this;
  }

  async pressEscape() {
    await this._user.keyboard("{Escape}");
    return this;
  }
}

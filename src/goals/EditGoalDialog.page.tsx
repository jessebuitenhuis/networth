import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { EditGoalDialog } from "./EditGoalDialog";
import type { Goal } from "./Goal.type";
import { GoalProvider, useGoals } from "./GoalContext";

const defaultGoal: Goal = {
  id: "1",
  name: "Emergency Fund",
  targetAmount: 10000,
};

function TestHarness({ goal }: { goal: Goal }) {
  const { goals } = useGoals();
  return (
    <div>
      <EditGoalDialog goal={goal} />
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

export class EditGoalDialogPage {
  private constructor(private _user: ReturnType<typeof userEvent.setup>) {}

  static render(goal: Goal = defaultGoal) {
    const user = userEvent.setup();
    render(
      <GoalProvider>
        <TestHarness goal={goal} />
      </GoalProvider>
    );
    return new EditGoalDialogPage(user);
  }

  get triggerButton() {
    return screen.getByRole("button", { name: "Edit Goal" });
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

  get saveButton() {
    return screen.getByRole("button", { name: "Save" });
  }

  get deleteButton() {
    return screen.getByRole("button", { name: "Delete" });
  }

  get goalsList() {
    return screen.getByTestId("goals");
  }

  queryDeleteConfirmText() {
    return screen.queryByText(/are you sure/i);
  }

  getDeleteConfirmText() {
    return screen.getByText(/are you sure/i);
  }

  get confirmDeleteButton() {
    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    return deleteButtons[deleteButtons.length - 1];
  }

  get cancelDeleteButton() {
    return screen.getByRole("button", { name: "Cancel" });
  }

  async open() {
    await this._user.click(this.triggerButton);
    return this;
  }

  async clearAndFillName(name: string) {
    await this._user.clear(this.nameInput);
    if (name) {
      await this._user.type(this.nameInput, name);
    }
    return this;
  }

  async clearAndFillTargetAmount(amount: string) {
    const input = this.targetAmountInput;
    await this._user.clear(input);
    await this._user.type(input, amount);
    return this;
  }

  async save() {
    await this._user.click(this.saveButton);
    return this;
  }

  async pressEscape() {
    await this._user.keyboard("{Escape}");
    return this;
  }

  async clickDelete() {
    await this._user.click(this.deleteButton);
    return this;
  }

  async confirmDelete() {
    await this._user.click(this.confirmDeleteButton);
    return this;
  }

  async cancelDelete() {
    await this._user.click(this.cancelDeleteButton);
    return this;
  }
}

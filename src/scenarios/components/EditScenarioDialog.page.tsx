import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  RecurringTransactionProvider,
  useRecurringTransactions,
} from "@/recurring-transactions/RecurringTransactionContext";
import type { Scenario } from "@/scenarios/Scenario.type";
import { ScenarioProvider, useScenarios } from "@/scenarios/ScenarioContext";
import { BasePageObject } from "@/test/page/BasePageObject";
import {
  TransactionProvider,
  useTransactions,
} from "@/transactions/TransactionContext";

import { EditScenarioDialog } from "./EditScenarioDialog";

const defaultScenario: Scenario = {
  id: "1",
  name: "Test Scenario",
};

function TestHarness({
  scenario,
  onDelete,
}: {
  scenario: Scenario;
  onDelete?: (id: string) => void;
}) {
  const { scenarios } = useScenarios();
  const { transactions } = useTransactions();
  const { recurringTransactions } = useRecurringTransactions();
  return (
    <div>
      <EditScenarioDialog scenario={scenario} onDelete={onDelete} />
      <ul data-testid="scenarios">
        {scenarios.map((s) => (
          <li key={s.id}>{s.name}</li>
        ))}
      </ul>
      <span data-testid="tx-count">{transactions.length}</span>
      <span data-testid="rt-count">{recurringTransactions.length}</span>
    </div>
  );
}

export class EditScenarioDialogPage extends BasePageObject {
  private constructor(user: ReturnType<typeof userEvent.setup>) {
    super(user);
  }

  static render(
    scenario: Scenario = defaultScenario,
    onDelete?: (id: string) => void,
  ) {
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <TransactionProvider>
          <RecurringTransactionProvider>
            <TestHarness scenario={scenario} onDelete={onDelete} />
          </RecurringTransactionProvider>
        </TransactionProvider>
      </ScenarioProvider>,
    );
    return new EditScenarioDialogPage(user);
  }

  // --- Element getters ---

  get triggerButton() {
    return screen.getByRole("button", { name: "Edit Scenario" });
  }

  get dialog() {
    return screen.getByRole("dialog", { name: "Edit Scenario" });
  }

  get nameInput() {
    return screen.getByLabelText("Name");
  }

  get inflationRateInput() {
    return screen.getByLabelText("Annual Inflation Rate (%)");
  }

  get saveButton() {
    return screen.getByRole("button", { name: "Save" });
  }

  get deleteButton() {
    return screen.getByRole("button", { name: "Delete" });
  }

  get confirmDeleteButton() {
    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    return deleteButtons[deleteButtons.length - 1];
  }

  get cancelButton() {
    return screen.getByRole("button", { name: "Cancel" });
  }

  get scenariosList() {
    return screen.getByTestId("scenarios");
  }

  get txCount() {
    return screen.getByTestId("tx-count");
  }

  get rtCount() {
    return screen.getByTestId("rt-count");
  }

  // --- Query methods ---

  queryDialog() {
    return screen.queryByRole("dialog", { name: "Edit Scenario" });
  }

  queryAnyDialog() {
    return screen.queryByRole("dialog");
  }

  queryCascadeWarning() {
    return screen.queryByText(
      /all associated transactions will be permanently removed/i,
    );
  }

  getCascadeWarning() {
    return screen.getByText(
      /all associated transactions will be permanently removed/i,
    );
  }

  // --- Actions ---

  async open() {
    await this._user.click(this.triggerButton);
    return this;
  }

  async fillName(name: string) {
    await this._user.clear(this.nameInput);
    if (name) {
      await this._user.type(this.nameInput, name);
    }
    return this;
  }

  async fillInflationRate(rate: string) {
    await this._user.type(this.inflationRateInput, rate);
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
    await this._user.click(this.cancelButton);
    return this;
  }
}

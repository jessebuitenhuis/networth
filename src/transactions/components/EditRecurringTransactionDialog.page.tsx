import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { RecurrenceFrequency } from "@/recurring-transactions/RecurrenceFrequency";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import type { Scenario } from "@/scenarios/Scenario.type";
import { BasePageObject } from "@/test/page/BasePageObject";

import { EditRecurringTransactionDialog } from "./EditRecurringTransactionDialog";

const defaultRecurringTransaction: RecurringTransaction = {
  id: "r1",
  accountId: "a1",
  amount: 5000,
  description: "Salary",
  frequency: RecurrenceFrequency.Monthly,
  startDate: "2024-01-15",
  endDate: "2024-12-31",
};

type RenderOptions = {
  recurringTransaction?: RecurringTransaction;
  scenarios?: Scenario[];
  onSave?: ReturnType<typeof vi.fn>;
  onDelete?: ReturnType<typeof vi.fn>;
  onCreateScenario?: ReturnType<typeof vi.fn>;
  onCreateCategory?: ReturnType<typeof vi.fn>;
};

export class EditRecurringTransactionDialogPage extends BasePageObject {
  readonly onSave: ReturnType<typeof vi.fn>;
  readonly onDelete: ReturnType<typeof vi.fn>;
  readonly onCreateScenario: ReturnType<typeof vi.fn>;
  readonly onCreateCategory: ReturnType<typeof vi.fn>;

  private constructor(
    user: ReturnType<typeof userEvent.setup>,
    onSave: ReturnType<typeof vi.fn>,
    onDelete: ReturnType<typeof vi.fn>,
    onCreateScenario: ReturnType<typeof vi.fn>,
    onCreateCategory: ReturnType<typeof vi.fn>,
  ) {
    super(user);
    this.onSave = onSave;
    this.onDelete = onDelete;
    this.onCreateScenario = onCreateScenario;
    this.onCreateCategory = onCreateCategory;
  }

  static render(options: RenderOptions = {}) {
    const user = userEvent.setup();
    const onSave = options.onSave ?? vi.fn();
    const onDelete = options.onDelete ?? vi.fn();
    const onCreateScenario = options.onCreateScenario ?? vi.fn();
    const onCreateCategory = options.onCreateCategory ?? vi.fn();

    render(
      <EditRecurringTransactionDialog
        recurringTransaction={options.recurringTransaction ?? defaultRecurringTransaction}
        scenarios={options.scenarios ?? []}
        categories={[]}
        onSave={onSave}
        onDelete={onDelete}
        onCreateScenario={onCreateScenario}
        onCreateCategory={onCreateCategory}
      />,
    );

    return new EditRecurringTransactionDialogPage(
      user,
      onSave,
      onDelete,
      onCreateScenario,
      onCreateCategory,
    );
  }

  // --- Element getters ---

  get triggerButton() {
    return screen.getByLabelText("Edit Transaction");
  }

  get amountInput() {
    return screen.getByLabelText("Amount");
  }

  get descriptionInput() {
    return screen.getByLabelText("Description");
  }

  get startDateInput() {
    return screen.getByLabelText("Start Date");
  }

  get endDateInput() {
    return screen.getByLabelText("End Date (optional)");
  }

  get frequencySelect() {
    return screen.getByRole("combobox", { name: "Frequency" });
  }

  get scenarioSelect() {
    return screen.getByRole("combobox", { name: "Scenario" });
  }

  get saveButton() {
    return screen.getByText("Save");
  }

  get deleteButton() {
    return screen.getByText("Delete");
  }

  get confirmDeleteButton() {
    const deleteButtons = screen.getAllByText("Delete");
    return deleteButtons[deleteButtons.length - 1];
  }

  get cancelButton() {
    return screen.getByText("Cancel");
  }

  // --- Query methods ---

  queryDialog() {
    return screen.queryByRole("dialog");
  }

  queryAmountInput() {
    return screen.queryByLabelText("Amount");
  }

  queryEditHeading() {
    return screen.queryByText("Edit Recurring Transaction");
  }

  queryDeleteHeading() {
    return screen.queryByText("Delete Recurring Transaction");
  }

  // --- Actions ---

  async open() {
    await this._user.click(this.triggerButton);
    return this;
  }

  async fillAmount(amount: string) {
    await this.clearAndType(this.amountInput, amount);
    return this;
  }

  async fillDescription(description: string) {
    await this.clearAndType(this.descriptionInput, description);
    return this;
  }

  async fillStartDate(date: string) {
    await this.clearAndType(this.startDateInput, date);
    return this;
  }

  async fillEndDate(date: string) {
    await this.clearAndType(this.endDateInput, date);
    return this;
  }

  async save() {
    await this._user.click(this.saveButton);
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

  async openScenarioDropdown() {
    await this._user.click(this.scenarioSelect);
    return this;
  }

  async selectScenario(name: string) {
    await this.selectOption(this.scenarioSelect, name);
    return this;
  }

  async createScenarioInline(name: string) {
    await this.selectScenario("Create new scenario...");
    await this._user.type(screen.getByLabelText(/scenario name/i), name);
    await this._user.click(screen.getByRole("button", { name: /create/i }));
    return this;
  }

  async closeWithEscape() {
    await this._user.keyboard("{Escape}");
    return this;
  }
}

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import type { Category } from "@/categories/Category.type";
import type { Scenario } from "@/scenarios/Scenario.type";
import { BasePageObject } from "@/test/page/BasePageObject";
import type { Transaction } from "@/transactions/Transaction.type";

import { EditTransactionDialog } from "./EditTransactionDialog";

const defaultTransaction: Transaction = {
  id: "t1",
  accountId: "a1",
  amount: 1000,
  date: "2024-01-15",
  description: "Test transaction",
};

type RenderOptions = {
  transaction?: Transaction;
  scenarios?: Scenario[];
  onSave?: ReturnType<typeof vi.fn>;
  onDelete?: ReturnType<typeof vi.fn>;
  onCreateScenario?: ReturnType<typeof vi.fn>;
  onCreateCategory?: ReturnType<typeof vi.fn>;
};

export class EditTransactionDialogPage extends BasePageObject {
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
      <EditTransactionDialog
        transaction={options.transaction ?? defaultTransaction}
        scenarios={options.scenarios ?? []}
        categories={[]}
        onSave={onSave as (t: Transaction) => void}
        onDelete={onDelete as (id: string) => void}
        onCreateScenario={onCreateScenario as (s: { id: string; name: string }) => void}
        onCreateCategory={onCreateCategory as (c: Category) => void}
      />,
    );

    return new EditTransactionDialogPage(
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

  get dateInput() {
    return screen.getByLabelText("Date");
  }

  get descriptionInput() {
    return screen.getByLabelText("Description");
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
    return screen.queryByText("Edit Transaction");
  }

  queryDeleteHeading() {
    return screen.queryByText("Delete Transaction");
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

  async fillDate(date: string) {
    await this.clearAndType(this.dateInput, date);
    return this;
  }

  async fillDescription(description: string) {
    await this.clearAndType(this.descriptionInput, description);
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
    const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true });
    document.dispatchEvent(event);
    return this;
  }
}

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TooltipProvider } from "@/components/ui/tooltip";
import { BasePageObject } from "@/test/page/BasePageObject";
import type { DisplayTransaction } from "@/transactions/DisplayTransaction.type";

import { TransactionTable } from "./TransactionTable";

type RenderOptions = {
  items: DisplayTransaction[];
  showAccountColumn?: boolean;
  withTooltipProvider?: boolean;
};

export class TransactionTablePage extends BasePageObject {
  private constructor(user: ReturnType<typeof userEvent.setup>) {
    super(user);
  }

  static render({ items, showAccountColumn, withTooltipProvider = false }: RenderOptions) {
    const user = userEvent.setup();
    const table = <TransactionTable items={items} showAccountColumn={showAccountColumn} />;
    render(withTooltipProvider ? <TooltipProvider>{table}</TooltipProvider> : table);
    return new TransactionTablePage(user);
  }

  // --- Element getters ---

  get dateHeader() {
    return screen.getByRole("columnheader", { name: /Date/ });
  }

  get descriptionHeader() {
    return screen.getByRole("columnheader", { name: /Description/ });
  }

  get amountHeader() {
    return screen.getByRole("columnheader", { name: /Amount/ });
  }

  get actionsHeader() {
    return screen.getByRole("columnheader", { name: "Actions" });
  }

  get accountHeader() {
    return screen.getByRole("columnheader", { name: /Account/ });
  }

  get recurringBadge() {
    return screen.getByText("Recurring");
  }

  get rows() {
    return screen.getAllByRole("row");
  }

  getDataRow(index: number) {
    return this.rows[index + 1]; // offset by 1 to skip header row
  }

  getScenarioIcon(scenarioName: string) {
    return screen.getByLabelText(`Scenario: ${scenarioName}`);
  }

  // --- Query methods (nullable) ---

  queryRecurringBadge() {
    return screen.queryByText("Recurring");
  }

  queryAccountHeader() {
    return screen.queryByRole("columnheader", { name: /Account/ });
  }

  queryScenarioIcon() {
    return screen.queryByLabelText(/^Scenario:/);
  }

  // --- Actions ---

  async sortByDate() {
    await this._user.click(this.dateHeader);
    return this;
  }

  async sortByDescription() {
    await this._user.click(this.descriptionHeader);
    return this;
  }

  async sortByAmount() {
    await this._user.click(this.amountHeader);
    return this;
  }

  async hoverScenarioIcon(scenarioName: string) {
    await this._user.hover(this.getScenarioIcon(scenarioName));
    return this;
  }
}

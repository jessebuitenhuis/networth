"use client";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Account } from "@/accounts/Account.type";
import { AccountProvider } from "@/accounts/AccountContext";
import type { Goal } from "@/goals/Goal.type";
import { GoalProvider } from "@/goals/GoalContext";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import { RecurringTransactionProvider } from "@/recurring-transactions/RecurringTransactionContext";
import type { Scenario } from "@/scenarios/Scenario.type";
import { ScenarioProvider } from "@/scenarios/ScenarioContext";
import { mockApiResponses } from "@/test/mocks/mockApiResponses";
import type { Transaction } from "@/transactions/Transaction.type";
import { TransactionProvider } from "@/transactions/TransactionContext";

import { ProjectedNetWorthChart } from "./ProjectedNetWorthChart";

type RenderOptions = {
  accounts?: Account[];
  transactions?: Transaction[];
  recurringTransactions?: RecurringTransaction[];
  scenarios?: Scenario[];
  selectedScenarioIds?: Set<string>;
  excludedAccountIds?: Set<string>;
  goals?: Goal[];
};

export class ProjectedNetWorthChartPage {
  private _user = userEvent.setup();

  static render(options: RenderOptions = {}) {
    const {
      accounts = [],
      transactions = [],
      recurringTransactions = [],
      scenarios = [],
      selectedScenarioIds = new Set<string>(),
      excludedAccountIds = new Set<string>(),
      goals = [],
    } = options;

    mockApiResponses({ accounts, transactions, recurringTransactions, scenarios, goals });

    const page = new ProjectedNetWorthChartPage();
    render(
      <AccountProvider>
        <TransactionProvider>
          <ScenarioProvider>
            <RecurringTransactionProvider>
              <GoalProvider>
                <ProjectedNetWorthChart
                  selectedScenarioIds={selectedScenarioIds}
                  excludedAccountIds={excludedAccountIds}
                />
              </GoalProvider>
            </RecurringTransactionProvider>
          </ScenarioProvider>
        </TransactionProvider>
      </AccountProvider>,
    );
    return page;
  }

  get chartContainer() {
    return screen.getByTestId("projected-chart");
  }

  periodButton(name: string) {
    return screen.getByRole("button", { name });
  }

  periodButtonPressed(name: string) {
    return this.periodButton(name).getAttribute("aria-pressed");
  }

  get previousButton() {
    return screen.getByRole("button", { name: "Previous period" });
  }

  get nextButton() {
    return screen.getByRole("button", { name: "Next period" });
  }

  queryPreviousButton() {
    return screen.queryByRole("button", { name: "Previous period" });
  }

  queryNextButton() {
    return screen.queryByRole("button", { name: "Next period" });
  }

  async selectPeriod(name: string) {
    await this._user.click(this.periodButton(name));
  }

  async clickNext() {
    await this._user.click(this.nextButton);
  }

  async clickPrevious() {
    await this._user.click(this.previousButton);
  }

  legendText(name: string) {
    return screen.getByText(name);
  }

  queryLegendText(name: string) {
    return screen.queryByText(name);
  }

  findLegendText(name: string) {
    return screen.findByText(name);
  }

  queryStartInput() {
    return screen.queryByLabelText("Start");
  }

  getStartInput() {
    return screen.getByLabelText("Start");
  }

  getEndInput() {
    return screen.getByLabelText("End");
  }

  async clearAndType(element: HTMLElement, text: string) {
    await this._user.clear(element);
    await this._user.type(element, text);
  }
}

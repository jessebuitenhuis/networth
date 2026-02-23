import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AccountProvider } from "@/accounts/AccountContext";
import { CategoryProvider } from "@/categories/CategoryContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { GoalProvider } from "@/goals/GoalContext";
import { RecurringTransactionProvider } from "@/recurring-transactions/RecurringTransactionContext";
import { ScenarioProvider } from "@/scenarios/ScenarioContext";
import { TransactionProvider } from "@/transactions/TransactionContext";

import Home from "./page";

export class DashboardPage {
  private constructor(private _user: ReturnType<typeof userEvent.setup>) {}

  static render() {
    const user = userEvent.setup();
    render(
      <SidebarProvider>
        <AccountProvider>
          <TransactionProvider>
            <ScenarioProvider>
              <RecurringTransactionProvider>
                <CategoryProvider>
                  <GoalProvider>
                    <Home />
                  </GoalProvider>
                </CategoryProvider>
              </RecurringTransactionProvider>
            </ScenarioProvider>
          </TransactionProvider>
        </AccountProvider>
      </SidebarProvider>
    );
    return new DashboardPage(user);
  }

  get heading() {
    return screen.getByRole("heading", { level: 1 });
  }

  getText(text: string | RegExp) {
    return screen.getByText(text);
  }

  async findText(text: string | RegExp) {
    return screen.findByText(text);
  }

  queryText(text: string | RegExp) {
    return screen.queryByText(text);
  }

  queryTestId(testId: string) {
    return screen.queryByTestId(testId);
  }

  async findTestId(testId: string) {
    return screen.findByTestId(testId);
  }

  getButton(name: string | RegExp) {
    return screen.getByRole("button", { name });
  }

  getDialog(name: string) {
    return screen.getByRole("dialog", { name });
  }

  async clickButton(name: string | RegExp) {
    await this._user.click(this.getButton(name));
    return this;
  }
}

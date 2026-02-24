import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AccountProvider } from "@/accounts/AccountContext";
import { CategoryProvider } from "@/categories/CategoryContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { GoalProvider } from "@/goals/GoalContext";
import { RecurringTransactionProvider } from "@/recurring-transactions/RecurringTransactionContext";
import { ScenarioProvider } from "@/scenarios/ScenarioContext";
import { TransactionProvider } from "@/transactions/TransactionContext";

import PlanningPage from "./page";

export class PlanningPageObject {
  private constructor(private _user: ReturnType<typeof userEvent.setup>) {}

  static render() {
    const user = userEvent.setup();
    render(
      <SidebarProvider>
        <AccountProvider>
          <TransactionProvider>
            <ScenarioProvider>
              <RecurringTransactionProvider>
                <GoalProvider>
                  <CategoryProvider>
                    <PlanningPage />
                  </CategoryProvider>
                </GoalProvider>
              </RecurringTransactionProvider>
            </ScenarioProvider>
          </TransactionProvider>
        </AccountProvider>
      </SidebarProvider>
    );
    return new PlanningPageObject(user);
  }

  getHeading(name: string) {
    return screen.getByRole("heading", { name });
  }

  getTestId(testId: string) {
    return screen.getByTestId(testId);
  }

  getButton(name: string | RegExp) {
    return screen.getByRole("button", { name });
  }

  async findButton(name: string | RegExp) {
    return screen.findByRole("button", { name });
  }

  queryButton(name: string | RegExp) {
    return screen.queryByRole("button", { name });
  }

  getCheckbox(name: string) {
    return screen.getByRole("checkbox", { name });
  }

  getLabel(name: string | RegExp) {
    return screen.getByLabelText(name);
  }

  private _getAllByRole(role: string, name: string | RegExp) {
    return screen.getAllByRole(role as "button", { name });
  }

  async clickButton(name: string | RegExp) {
    await this._user.click(this.getButton(name));
    return this;
  }

  async clickLastButton(name: string | RegExp) {
    const buttons = this._getAllByRole("button", name);
    await this._user.click(buttons[buttons.length - 1]);
    return this;
  }

  async clickCheckbox(name: string) {
    await this._user.click(this.getCheckbox(name));
    return this;
  }

  async typeIntoLabel(label: string | RegExp, text: string) {
    await this._user.type(this.getLabel(label), text);
    return this;
  }
}

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AccountProvider } from "@/accounts/AccountContext";
import { CategoryProvider } from "@/categories/CategoryContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { GoalProvider } from "@/goals/GoalContext";
import { RecurringTransactionProvider } from "@/recurring-transactions/RecurringTransactionContext";
import { ScenarioProvider } from "@/scenarios/ScenarioContext";
import { TransactionProvider } from "@/transactions/TransactionContext";

import { SetupWizard } from "./SetupWizard";

export class SetupWizardPage {
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
                    <SetupWizard />
                  </GoalProvider>
                </CategoryProvider>
              </RecurringTransactionProvider>
            </ScenarioProvider>
          </TransactionProvider>
        </AccountProvider>
      </SidebarProvider>,
    );
    return new SetupWizardPage(user);
  }

  get heading() {
    return screen.getByRole("heading", { level: 1 });
  }

  getButton(name: string | RegExp) {
    return screen.getByRole("button", { name });
  }

  queryButton(name: string | RegExp) {
    return screen.queryByRole("button", { name });
  }

  getText(text: string | RegExp) {
    return screen.getByText(text);
  }

  queryText(text: string | RegExp) {
    return screen.queryByText(text);
  }

  async findText(text: string | RegExp) {
    return screen.findByText(text);
  }

  getProgressBar() {
    return screen.getByRole("progressbar");
  }

  async clickButton(name: string | RegExp) {
    await this._user.click(this.getButton(name));
    return this;
  }

  async clickSuggestion(name: string) {
    await this._user.click(
      screen.getByRole("button", {
        name: new RegExp(`^[^A-Za-z]+ ${name}$`),
      }),
    );
    return this;
  }

  async type(label: string, text: string) {
    const input = screen.getByLabelText(label);
    await this._user.type(input, text);
    return this;
  }
}

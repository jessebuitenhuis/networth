import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Account } from "@/accounts/Account.type";
import { AccountProvider } from "@/accounts/AccountContext";
import type { Goal } from "@/goals/Goal.type";
import { GoalProvider } from "@/goals/GoalContext";
import { RecurringTransactionProvider } from "@/recurring-transactions/RecurringTransactionContext";
import { ScenarioProvider } from "@/scenarios/ScenarioContext";
import { mockApiResponses } from "@/test/mocks/mockApiResponses";
import { BasePageObject } from "@/test/page/BasePageObject";
import type { Transaction } from "@/transactions/Transaction.type";
import { TransactionProvider } from "@/transactions/TransactionContext";

import { GoalProgressSection } from "./GoalProgressSection";

type GoalProgressSectionRenderProps = {
  accounts?: Account[];
  transactions?: Transaction[];
  goals?: Goal[];
};

export class GoalProgressSectionPage extends BasePageObject {
  private constructor(
    user: ReturnType<typeof userEvent.setup>,
    public readonly container: HTMLElement,
  ) {
    super(user);
  }

  static render({ accounts = [], transactions = [], goals = [] }: GoalProgressSectionRenderProps = {}) {
    const user = userEvent.setup();
    mockApiResponses({ accounts, transactions, goals });

    const { container } = render(
      <AccountProvider>
        <TransactionProvider>
          <RecurringTransactionProvider>
            <ScenarioProvider>
              <GoalProvider>
                <GoalProgressSection />
              </GoalProvider>
            </ScenarioProvider>
          </RecurringTransactionProvider>
        </TransactionProvider>
      </AccountProvider>,
    );
    return new GoalProgressSectionPage(user, container);
  }

  async findByText(text: string | RegExp) {
    return screen.findByText(text);
  }

  getByText(text: string | RegExp) {
    return screen.getByText(text);
  }

  queryByText(text: string | RegExp) {
    return screen.queryByText(text);
  }
}

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Account } from "@/accounts/Account.type";
import { AccountProvider } from "@/accounts/AccountContext";
import { CategoryProvider } from "@/categories/CategoryContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RecurringTransactionProvider } from "@/recurring-transactions/RecurringTransactionContext";
import { ScenarioProvider } from "@/scenarios/ScenarioContext";
import { mockApiResponses } from "@/test/mocks/mockApiResponses";
import type { Transaction } from "@/transactions/Transaction.type";
import { TransactionProvider } from "@/transactions/TransactionContext";

import AccountsPage from "./page";

type RenderOptions = {
  accounts?: Account[];
  transactions?: Transaction[];
};

export class AccountsPageObject {
  private constructor(private _user: ReturnType<typeof userEvent.setup>) {}

  static render(opts: RenderOptions = {}) {
    mockApiResponses({
      accounts: opts.accounts ?? [],
      transactions: opts.transactions ?? [],
    });
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <SidebarProvider>
          <AccountProvider>
            <TransactionProvider>
              <ScenarioProvider>
                <RecurringTransactionProvider>
                  <CategoryProvider>
                    <AccountsPage />
                  </CategoryProvider>
                </RecurringTransactionProvider>
              </ScenarioProvider>
            </TransactionProvider>
          </AccountProvider>
        </SidebarProvider>
      </TooltipProvider>
    );
    return new AccountsPageObject(user);
  }

  async findHeading(name: string) {
    return screen.findByRole("heading", { name });
  }

  async findText(text: string | RegExp) {
    return screen.findByText(text);
  }

  getText(text: string | RegExp) {
    return screen.getByText(text);
  }

  queryText(text: string | RegExp) {
    return screen.queryByText(text);
  }

  async findButton(name: string | RegExp) {
    return screen.findByRole("button", { name });
  }

  async findLink(name: string | RegExp) {
    return screen.findByRole("link", { name });
  }
}

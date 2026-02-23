import { render, screen } from "@testing-library/react";

import { AccountProvider } from "@/accounts/AccountContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { RecurringTransactionProvider } from "@/recurring-transactions/RecurringTransactionContext";
import { ScenarioProvider } from "@/scenarios/ScenarioContext";
import { TransactionProvider } from "@/transactions/TransactionContext";

import { AppLayout } from "./AppLayout";
import type { NavGroup } from "./NavGroup.type";

export class AppLayoutPage {
  private constructor() {}

  static render(navGroups: NavGroup[], children: React.ReactNode) {
    render(
      <SidebarProvider>
        <AccountProvider>
          <TransactionProvider>
            <ScenarioProvider>
              <RecurringTransactionProvider>
                <AppLayout navGroups={navGroups}>{children}</AppLayout>
              </RecurringTransactionProvider>
            </ScenarioProvider>
          </TransactionProvider>
        </AccountProvider>
      </SidebarProvider>
    );
    return new AppLayoutPage();
  }

  getText(text: string) {
    return screen.getByText(text);
  }

  async findText(text: string) {
    return screen.findByText(text);
  }

  getLink(name: string | RegExp) {
    return screen.getByRole("link", { name });
  }

  async findLink(name: string | RegExp) {
    return screen.findByRole("link", { name });
  }

  getButton(name: string | RegExp) {
    return screen.getByRole("button", { name });
  }

  async findByText(text: string) {
    return screen.findByText(text);
  }
}

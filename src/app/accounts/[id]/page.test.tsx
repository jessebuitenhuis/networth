import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AccountProvider } from "@/context/AccountContext";
import { RecurringTransactionProvider } from "@/context/RecurringTransactionContext";
import { ScenarioProvider } from "@/context/ScenarioContext";
import { TransactionProvider } from "@/context/TransactionContext";
import type { Account } from "@/models/Account.type";
import { AccountType } from "@/models/AccountType";
import type { Transaction } from "@/models/Transaction.type";
import { mockResizeObserver } from "@/test/mocks/mockResizeObserver";
import { suppressRechartsWarnings } from "@/test/mocks/suppressRechartsWarnings";

import AccountDetailPage from "./page";

mockResizeObserver();
suppressRechartsWarnings();

const accounts: Account[] = [
  { id: "a1", name: "Checking", type: AccountType.Asset },
];

const transactions: Transaction[] = [
  { id: "t1", accountId: "a1", amount: 1000, date: "2024-01-01", description: "Opening balance" },
  { id: "t2", accountId: "a1", amount: -200, date: "2024-01-02", description: "Groceries" },
];

function renderPage(id: string) {
  return render(
    <SidebarProvider>
      <AccountProvider>
        <TransactionProvider>
          <ScenarioProvider>
            <RecurringTransactionProvider>
              <AccountDetailPage params={{ id }} />
            </RecurringTransactionProvider>
          </ScenarioProvider>
        </TransactionProvider>
      </AccountProvider>
    </SidebarProvider>
  );
}

describe("AccountDetailPage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("crypto", { randomUUID: () => "test-uuid" });
  });

  it("shows account name as heading", async () => {
    localStorage.setItem("accounts", JSON.stringify(accounts));
    localStorage.setItem("transactions", JSON.stringify(transactions));
    renderPage("a1");

    expect(await screen.findByRole("heading", { name: "Checking" })).toBeInTheDocument();
  });

  it("shows current balance computed from transactions", async () => {
    localStorage.setItem("accounts", JSON.stringify(accounts));
    localStorage.setItem("transactions", JSON.stringify(transactions));
    renderPage("a1");

    expect(await screen.findByText("US$800.00")).toBeInTheDocument();
  });

  it("renders transaction list", async () => {
    localStorage.setItem("accounts", JSON.stringify(accounts));
    localStorage.setItem("transactions", JSON.stringify(transactions));
    renderPage("a1");

    expect(await screen.findByText("Opening balance")).toBeInTheDocument();
    expect(screen.getByText("Groceries")).toBeInTheDocument();
  });

  it("renders add transaction dialog trigger", async () => {
    localStorage.setItem("accounts", JSON.stringify(accounts));
    localStorage.setItem("transactions", JSON.stringify([]));
    renderPage("a1");

    expect(await screen.findByRole("button", { name: "Add Transaction" })).toBeInTheDocument();
  });

  it("shows 'Account not found' for invalid ID", () => {
    renderPage("nonexistent");

    expect(screen.getByText("Account not found")).toBeInTheDocument();
  });
});

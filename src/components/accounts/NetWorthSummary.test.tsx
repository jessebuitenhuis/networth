import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { AccountProvider } from "@/context/AccountContext";
import { TransactionProvider } from "@/context/TransactionContext";
import type { Account } from "@/models/Account.type";
import { AccountType } from "@/models/AccountType";
import type { Transaction } from "@/models/Transaction.type";

import { NetWorthSummary } from "./NetWorthSummary";

function renderWithProvider(
  accounts: Account[] = [],
  transactions: Transaction[] = []
) {
  localStorage.setItem("accounts", JSON.stringify(accounts));
  localStorage.setItem("transactions", JSON.stringify(transactions));
  return render(
    <AccountProvider>
      <TransactionProvider>
        <NetWorthSummary />
      </TransactionProvider>
    </AccountProvider>
  );
}

describe("NetWorthSummary", () => {
  beforeEach(() => localStorage.clear());

  it("displays $0.00 with no accounts", () => {
    renderWithProvider();
    expect(screen.getByText("US$0.00")).toBeInTheDocument();
  });

  it("displays sum of assets minus liabilities", async () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
      { id: "2", name: "Savings", type: AccountType.Asset },
      { id: "3", name: "Credit Card", type: AccountType.Liability },
    ];
    const transactions: Transaction[] = [
      { id: "t1", accountId: "1", amount: 5000, date: "2024-01-01", description: "Opening" },
      { id: "t2", accountId: "2", amount: 3000, date: "2024-01-01", description: "Opening" },
      { id: "t3", accountId: "3", amount: 1500, date: "2024-01-01", description: "Opening" },
    ];

    renderWithProvider(accounts, transactions);

    expect(await screen.findByText("US$6,500.00")).toBeInTheDocument();
  });

  it("displays negative net worth", async () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
      { id: "2", name: "Loan", type: AccountType.Liability },
    ];
    const transactions: Transaction[] = [
      { id: "t1", accountId: "1", amount: 500, date: "2024-01-01", description: "Opening" },
      { id: "t2", accountId: "2", amount: 2000, date: "2024-01-01", description: "Opening" },
    ];

    renderWithProvider(accounts, transactions);

    expect(await screen.findByText("-US$1,500.00")).toBeInTheDocument();
  });

  it("has a heading", () => {
    renderWithProvider();
    expect(screen.getByText("Net Worth")).toBeInTheDocument();
  });
});

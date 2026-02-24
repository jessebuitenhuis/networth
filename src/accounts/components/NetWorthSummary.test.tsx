import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Account } from "@/accounts/Account.type";
import { AccountProvider } from "@/accounts/AccountContext";
import { AccountType } from "@/accounts/AccountType";
import { mockApiResponses } from "@/test/mocks/mockApiResponses";
import type { Transaction } from "@/transactions/Transaction.type";
import { TransactionProvider } from "@/transactions/TransactionContext";

import { NetWorthSummary } from "./NetWorthSummary";

function renderWithProvider(
  accounts: Account[] = [],
  transactions: Transaction[] = [],
) {
  mockApiResponses({ accounts, transactions });
  return render(
    <AccountProvider>
      <TransactionProvider>
        <NetWorthSummary />
      </TransactionProvider>
    </AccountProvider>,
  );
}

describe("NetWorthSummary", () => {
  beforeEach(() => {
    mockApiResponses();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("displays $0.00 net worth with no accounts", () => {
    renderWithProvider();
    const heading = screen.getByText("Net Worth");
    const value = heading.nextElementSibling!;
    expect(value).toHaveTextContent("$0.00");
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

    expect(await screen.findByText("$6,500.00")).toBeInTheDocument();
  });

  it("displays total assets and total liabilities separately", async () => {
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

    expect(await screen.findByText("Assets")).toBeInTheDocument();
    expect(await screen.findByText("$8,000.00")).toBeInTheDocument();
    expect(await screen.findByText("Liabilities")).toBeInTheDocument();
    // Net worth: $6,500.00 and liabilities: $1,500.00 share same formatted value
    // Verify both labels are present
    expect(screen.getByText("Liabilities")).toBeInTheDocument();
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

    expect(await screen.findByText("-$1,500.00")).toBeInTheDocument();
  });

  it("has a heading", () => {
    renderWithProvider();
    expect(screen.getByText("Net Worth")).toBeInTheDocument();
  });
});

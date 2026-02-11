import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { AccountList } from "./AccountList";
import { AccountType } from "@/models/AccountType";
import type { Account } from "@/models/Account";
import type { Transaction } from "@/models/Transaction";
import { AccountProvider } from "@/context/AccountContext";
import { TransactionProvider } from "@/context/TransactionContext";

const accounts: Account[] = [
  { id: "1", name: "Checking", type: AccountType.Asset },
  { id: "2", name: "Credit Card", type: AccountType.Liability },
];

const transactions: Transaction[] = [
  { id: "t1", accountId: "1", amount: 1000, date: "2024-01-01", description: "Opening" },
  { id: "t2", accountId: "2", amount: 500, date: "2024-01-01", description: "Opening" },
];

function renderWithProvider(
  initialAccounts: Account[] = [],
  initialTransactions: Transaction[] = []
) {
  localStorage.setItem("accounts", JSON.stringify(initialAccounts));
  localStorage.setItem("transactions", JSON.stringify(initialTransactions));
  return render(
    <AccountProvider>
      <TransactionProvider>
        <AccountList />
      </TransactionProvider>
    </AccountProvider>
  );
}

describe("AccountList", () => {
  beforeEach(() => localStorage.clear());

  it("shows empty message when no accounts exist", () => {
    renderWithProvider();
    expect(screen.getByText("No accounts yet.")).toBeInTheDocument();
  });

  it("lists all accounts", async () => {
    renderWithProvider(accounts, transactions);

    expect(await screen.findByText("Checking")).toBeInTheDocument();
    expect(screen.getByText("Credit Card")).toBeInTheDocument();
  });

  it("displays account type", async () => {
    renderWithProvider(accounts, transactions);

    expect(await screen.findByText("Asset")).toBeInTheDocument();
    expect(screen.getByText("Liability")).toBeInTheDocument();
  });

  it("displays balance computed from transactions", async () => {
    renderWithProvider(accounts, transactions);

    expect(await screen.findByText("$1,000.00")).toBeInTheDocument();
    expect(screen.getByText("$500.00")).toBeInTheDocument();
  });
});

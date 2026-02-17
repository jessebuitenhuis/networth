import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import type { Account } from "@/accounts/Account.type";
import { AccountProvider } from "@/accounts/AccountContext";
import { AccountType } from "@/accounts/AccountType";
import type { Goal } from "@/goals/Goal.type";
import { GoalProvider } from "@/goals/GoalContext";
import { RecurringTransactionProvider } from "@/recurring-transactions/RecurringTransactionContext";
import { ScenarioProvider } from "@/scenarios/ScenarioContext";
import { mockApiResponses } from "@/test/mocks/mockApiResponses";
import type { Transaction } from "@/transactions/Transaction.type";
import { TransactionProvider } from "@/transactions/TransactionContext";

import { GoalProgressSection } from "./GoalProgressSection";

function renderWithProviders(
  accounts: Account[] = [],
  transactions: Transaction[] = [],
  goals: Goal[] = []
) {
  mockApiResponses({ accounts, transactions, goals });

  return render(
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
    </AccountProvider>
  );
}

describe("GoalProgressSection", () => {
  beforeEach(() => mockApiResponses());

  it("renders nothing when there are no goals", () => {
    const { container } = renderWithProviders();
    expect(container).toBeEmptyDOMElement();
  });

  it("renders section heading when goals exist", async () => {
    const goals: Goal[] = [{ id: "1", name: "Goal 1", targetAmount: 10000 }];
    renderWithProviders([], [], goals);
    expect(await screen.findByText("Goal Progress")).toBeInTheDocument();
  });

  it("renders goal progress cards", async () => {
    const goals: Goal[] = [
      { id: "g1", name: "Emergency Fund", targetAmount: 10000 },
      { id: "g2", name: "Vacation", targetAmount: 5000 },
    ];
    renderWithProviders([], [], goals);

    expect(await screen.findByText("Emergency Fund")).toBeInTheDocument();
    expect(screen.getByText("Vacation")).toBeInTheDocument();
  });

  it("calculates correct percentage from account data", async () => {
    const accounts: Account[] = [
      { id: "1", name: "Savings", type: AccountType.Asset },
      { id: "2", name: "Checking", type: AccountType.Asset },
    ];
    const transactions: Transaction[] = [
      { id: "t1", accountId: "1", amount: 5000, date: "2024-01-01", description: "Initial" },
      { id: "t2", accountId: "2", amount: 3000, date: "2024-01-01", description: "Initial" },
    ];
    const goals: Goal[] = [{ id: "g1", name: "Goal", targetAmount: 8000 }];

    renderWithProviders(accounts, transactions, goals);

    expect(await screen.findByText("100% complete")).toBeInTheDocument();
    expect(await screen.findByText("Achieved!")).toBeInTheDocument();
  });

  it("displays not projected message when no projection available", async () => {
    const accounts: Account[] = [
      { id: "1", name: "Savings", type: AccountType.Asset },
    ];
    const transactions: Transaction[] = [
      { id: "t1", accountId: "1", amount: 2000, date: "2024-01-01", description: "Initial" },
    ];
    const goals: Goal[] = [{ id: "g1", name: "Big Goal", targetAmount: 1000000 }];

    renderWithProviders(accounts, transactions, goals);

    expect(await screen.findByText("Not projected within 50 years")).toBeInTheDocument();
  });

  it("correctly calculates net worth with liabilities", async () => {
    const accounts: Account[] = [
      { id: "1", name: "Savings", type: AccountType.Asset },
      { id: "2", name: "Loan", type: AccountType.Liability },
    ];
    const transactions: Transaction[] = [
      { id: "t1", accountId: "1", amount: 10000, date: "2024-01-01", description: "Savings" },
      { id: "t2", accountId: "2", amount: 3000, date: "2024-01-01", description: "Loan" },
    ];
    const goals: Goal[] = [{ id: "g1", name: "Goal", targetAmount: 7000 }];

    renderWithProviders(accounts, transactions, goals);

    expect(await screen.findByText("100% complete")).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectedNetWorthChart } from "./ProjectedNetWorthChart";
import { AccountType } from "@/models/AccountType";
import type { Account } from "@/models/Account";
import type { Transaction } from "@/models/Transaction";
import { AccountProvider } from "@/context/AccountContext";
import { TransactionProvider } from "@/context/TransactionContext";
import { RecurringTransactionProvider } from "@/context/RecurringTransactionContext";
import { ScenarioProvider } from "@/context/ScenarioContext";
import type { RecurringTransaction } from "@/models/RecurringTransaction";
import type { Scenario } from "@/models/Scenario";
import { RecurrenceFrequency } from "@/models/RecurrenceFrequency";

vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);

function renderWithProviders(
  accounts: Account[] = [],
  transactions: Transaction[] = [],
  recurringTransactions: RecurringTransaction[] = [],
  scenarios: Scenario[] = [],
  activeScenarioId: string | null = null
) {
  localStorage.setItem("accounts", JSON.stringify(accounts));
  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem("recurringTransactions", JSON.stringify(recurringTransactions));
  if (scenarios.length > 0) {
    localStorage.setItem("scenarios", JSON.stringify(scenarios));
  }
  if (activeScenarioId) {
    localStorage.setItem("activeScenarioId", activeScenarioId);
  }
  return render(
    <AccountProvider>
      <TransactionProvider>
        <ScenarioProvider>
          <RecurringTransactionProvider>
            <ProjectedNetWorthChart />
          </RecurringTransactionProvider>
        </ScenarioProvider>
      </TransactionProvider>
    </AccountProvider>
  );
}

describe("ProjectedNetWorthChart", () => {
  beforeEach(() => localStorage.clear());

  it("renders with 1M selected by default", () => {
    renderWithProviders();

    expect(screen.getByRole("button", { name: "1M" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("switches period on button click", async () => {
    renderWithProviders();

    await userEvent.click(screen.getByRole("button", { name: "1Y" }));

    expect(screen.getByRole("button", { name: "1Y" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "1M" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("renders the chart container", () => {
    renderWithProviders();

    expect(screen.getByTestId("projected-chart")).toBeInTheDocument();
  });

  it("does not show custom date range picker by default", () => {
    renderWithProviders();

    expect(screen.queryByLabelText("Start")).not.toBeInTheDocument();
  });

  it("shows custom date range picker when Custom is selected", async () => {
    renderWithProviders();

    await userEvent.click(screen.getByRole("button", { name: "Custom" }));

    expect(screen.getByLabelText("Start")).toBeInTheDocument();
    expect(screen.getByLabelText("End")).toBeInTheDocument();
  });

  it("renders legend with account names", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
      { id: "2", name: "Savings", type: AccountType.Asset },
    ];
    renderWithProviders(accounts);

    expect(screen.getByRole("button", { name: "Checking" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Savings" })).toBeInTheDocument();
  });

  it("toggles an account off when clicked", async () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
      { id: "2", name: "Savings", type: AccountType.Asset },
    ];
    renderWithProviders(accounts);

    await userEvent.click(screen.getByRole("button", { name: "Savings" }));

    expect(screen.getByRole("button", { name: "Savings" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("only includes recurring transactions for active scenario", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
    ];
    const scenarios: Scenario[] = [
      { id: "scenario-1", name: "Base Plan" },
      { id: "scenario-2", name: "Optimistic" },
    ];
    const recurringTransactions: RecurringTransaction[] = [
      {
        id: "rt-1",
        accountId: "1",
        amount: 100,
        description: "Base salary",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2024-01-01",
        scenarioId: "scenario-1",
      },
      {
        id: "rt-2",
        accountId: "1",
        amount: 200,
        description: "Bonus income",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2024-01-01",
        scenarioId: "scenario-2",
      },
    ];

    renderWithProviders(
      accounts,
      [],
      recurringTransactions,
      scenarios,
      "scenario-1"
    );

    expect(screen.getByTestId("projected-chart")).toBeInTheDocument();
  });

  it("treats undefined scenarioId as default scenario", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
    ];
    const scenarios: Scenario[] = [
      { id: "scenario-1", name: "Base Plan" },
    ];
    const recurringTransactions: RecurringTransaction[] = [
      {
        id: "rt-1",
        accountId: "1",
        amount: 100,
        description: "Legacy transaction",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2024-01-01",
      },
    ];

    renderWithProviders(
      accounts,
      [],
      recurringTransactions,
      scenarios,
      "scenario-1"
    );

    expect(screen.getByTestId("projected-chart")).toBeInTheDocument();
  });

  it("includes projected transactions for active scenario", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
    ];
    const scenarios: Scenario[] = [
      { id: "scenario-1", name: "Base Plan" },
      { id: "scenario-2", name: "Optimistic" },
    ];
    const transactions: Transaction[] = [
      {
        id: "t-1",
        accountId: "1",
        amount: 500,
        date: "2024-06-01",
        description: "Projected bonus",
        isProjected: true,
        scenarioId: "scenario-1",
      },
      {
        id: "t-2",
        accountId: "1",
        amount: 1000,
        date: "2024-07-01",
        description: "Optimistic bonus",
        isProjected: true,
        scenarioId: "scenario-2",
      },
    ];

    renderWithProviders(accounts, transactions, [], scenarios, "scenario-1");

    expect(screen.getByTestId("projected-chart")).toBeInTheDocument();
  });

  it("toggles an account back on when clicked twice", async () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
      { id: "2", name: "Savings", type: AccountType.Asset },
    ];
    renderWithProviders(accounts);

    await userEvent.click(screen.getByRole("button", { name: "Savings" }));
    expect(screen.getByRole("button", { name: "Savings" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );

    await userEvent.click(screen.getByRole("button", { name: "Savings" }));
    expect(screen.getByRole("button", { name: "Savings" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("updates custom range when date inputs change", async () => {
    renderWithProviders();

    await userEvent.click(screen.getByRole("button", { name: "Custom" }));

    const startInput = screen.getByLabelText("Start");
    const endInput = screen.getByLabelText("End");

    await userEvent.clear(startInput);
    await userEvent.type(startInput, "2024-01-01");
    await userEvent.clear(endInput);
    await userEvent.type(endInput, "2024-12-31");

    expect(startInput).toHaveValue("2024-01-01");
    expect(endInput).toHaveValue("2024-12-31");
  });
});

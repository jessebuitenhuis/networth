import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AccountType } from "@/accounts/AccountType";
import { RecurrenceFrequency } from "@/recurring-transactions/RecurrenceFrequency";
import { mockApiResponses } from "@/test/mocks/mockApiResponses";

import { ScenarioTransactionListPage } from "./ScenarioTransactionList.page";

describe("ScenarioTransactionList", () => {
  beforeEach(() => {
    mockApiResponses();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows only transactions for active scenario", async () => {
    const page = ScenarioTransactionListPage.render({
      accounts: [{ id: "1", name: "Checking", type: AccountType.Asset }],
      scenarios: [
        { id: "scenario-1", name: "Base Plan" },
        { id: "scenario-2", name: "Optimistic" },
      ],
      recurringTransactions: [
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
          description: "Bonus",
          frequency: RecurrenceFrequency.Monthly,
          startDate: "2024-01-01",
          scenarioId: "scenario-2",
        },
      ],
      selectedScenarioIds: new Set(["scenario-1"]),
    });

    expect(await page.findText(/Base salary/)).toBeInTheDocument();
    expect(page.queryText(/Bonus/)).not.toBeInTheDocument();
  });

  it("shows transactions for active scenario", async () => {
    const page = ScenarioTransactionListPage.render({
      accounts: [{ id: "1", name: "Checking", type: AccountType.Asset }],
      scenarios: [{ id: "scenario-1", name: "Base Plan" }],
      transactions: [
        {
          id: "t-1",
          accountId: "1",
          amount: 500,
          date: "2024-06-01",
          description: "Bonus payment",
          scenarioId: "scenario-1",
        },
      ],
      selectedScenarioIds: new Set(["scenario-1"]),
    });

    expect(await page.findText(/Bonus payment/)).toBeInTheDocument();
  });

  it("shows empty state when no transactions", async () => {
    const page = ScenarioTransactionListPage.render({
      scenarios: [{ id: "scenario-1", name: "Base Plan" }],
      selectedScenarioIds: new Set(["scenario-1"]),
    });

    expect(await page.findText(/no transactions yet/i)).toBeInTheDocument();
  });

  it("deletes recurring transaction when delete is clicked", async () => {
    const page = ScenarioTransactionListPage.render({
      accounts: [{ id: "1", name: "Checking", type: AccountType.Asset }],
      scenarios: [{ id: "scenario-1", name: "Base Plan" }],
      recurringTransactions: [
        {
          id: "rt-1",
          accountId: "1",
          amount: 100,
          description: "Salary",
          frequency: RecurrenceFrequency.Monthly,
          startDate: "2024-01-01",
          scenarioId: "scenario-1",
        },
      ],
      selectedScenarioIds: new Set(["scenario-1"]),
    });

    await page.clickEditButton();
    await page.clickDeleteButton();
    await page.clickLastDeleteButton();

    expect(page.queryText(/Salary/)).not.toBeInTheDocument();
  });

  it("treats undefined scenarioId as default scenario", async () => {
    const page = ScenarioTransactionListPage.render({
      accounts: [{ id: "1", name: "Checking", type: AccountType.Asset }],
      scenarios: [{ id: "scenario-1", name: "Base Plan" }],
      recurringTransactions: [
        {
          id: "rt-1",
          accountId: "1",
          amount: 100,
          description: "Legacy transaction",
          frequency: RecurrenceFrequency.Monthly,
          startDate: "2024-01-01",
        },
      ],
      selectedScenarioIds: new Set(["scenario-1"]),
    });

    expect(await page.findText(/Legacy transaction/)).toBeInTheDocument();
  });

  it("sorts transactions by date descending (newest first)", async () => {
    const page = ScenarioTransactionListPage.render({
      accounts: [{ id: "1", name: "Checking", type: AccountType.Asset }],
      scenarios: [{ id: "scenario-1", name: "Base Plan" }],
      transactions: [
        {
          id: "t-1",
          accountId: "1",
          amount: 100,
          date: "2024-01-15",
          description: "Old transaction",
          isProjected: true,
          scenarioId: "scenario-1",
        },
        {
          id: "t-2",
          accountId: "1",
          amount: 200,
          date: "2024-06-15",
          description: "Recent transaction",
          isProjected: true,
          scenarioId: "scenario-1",
        },
        {
          id: "t-3",
          accountId: "1",
          amount: 150,
          date: "2024-03-15",
          description: "Middle transaction",
          isProjected: true,
          scenarioId: "scenario-1",
        },
      ],
      selectedScenarioIds: new Set(["scenario-1"]),
    });

    await page.findText(/Recent transaction/);
    const items = page.getAllByText(/transaction/);
    expect(items[0]).toHaveTextContent("Recent transaction");
    expect(items[1]).toHaveTextContent("Middle transaction");
    expect(items[2]).toHaveTextContent("Old transaction");
  });

  it("shows Unknown for transactions with unknown account", async () => {
    const page = ScenarioTransactionListPage.render({
      scenarios: [{ id: "scenario-1", name: "Base Plan" }],
      transactions: [
        {
          id: "t-1",
          accountId: "unknown-account",
          amount: 100,
          date: "2024-06-15",
          description: "Orphan transaction",
          isProjected: true,
          scenarioId: "scenario-1",
        },
      ],
      selectedScenarioIds: new Set(["scenario-1"]),
    });

    expect(await page.findText(/Orphan transaction/)).toBeInTheDocument();
  });

  it("handles recurring transaction with no next occurrence", async () => {
    const page = ScenarioTransactionListPage.render({
      accounts: [{ id: "1", name: "Checking", type: AccountType.Asset }],
      scenarios: [{ id: "scenario-1", name: "Base Plan" }],
      recurringTransactions: [
        {
          id: "rt-1",
          accountId: "1",
          amount: 100,
          description: "Ended transaction",
          frequency: RecurrenceFrequency.Monthly,
          startDate: "2020-01-01",
          endDate: "2020-12-31",
          scenarioId: "scenario-1",
        },
      ],
      selectedScenarioIds: new Set(["scenario-1"]),
    });

    expect(await page.findText(/no transactions yet/i)).toBeInTheDocument();
  });

  it("includes baseline transactions (no scenarioId) in all scenarios", async () => {
    const page = ScenarioTransactionListPage.render({
      accounts: [{ id: "1", name: "Checking", type: AccountType.Asset }],
      scenarios: [
        { id: "scenario-1", name: "Base Plan" },
        { id: "scenario-2", name: "Alternative" },
      ],
      transactions: [
        {
          id: "t-1",
          accountId: "1",
          amount: 100,
          date: "2024-06-15",
          description: "Baseline transaction",
          isProjected: true,
        },
      ],
      selectedScenarioIds: new Set(["scenario-2"]),
    });

    expect(await page.findText(/Baseline transaction/)).toBeInTheDocument();
  });

  it("shows Unknown for recurring transactions with unknown account", async () => {
    const page = ScenarioTransactionListPage.render({
      scenarios: [{ id: "scenario-1", name: "Base Plan" }],
      recurringTransactions: [
        {
          id: "rt-1",
          accountId: "unknown-account",
          amount: 100,
          description: "Orphan recurring",
          frequency: RecurrenceFrequency.Monthly,
          startDate: "2024-01-01",
          scenarioId: "scenario-1",
        },
      ],
      selectedScenarioIds: new Set(["scenario-1"]),
    });

    expect(await page.findText(/Orphan recurring/)).toBeInTheDocument();
  });

  it("shows only baseline transactions when activeScenarioId is null", async () => {
    const page = ScenarioTransactionListPage.render({
      accounts: [{ id: "1", name: "Checking", type: AccountType.Asset }],
      scenarios: [{ id: "scenario-1", name: "Base Plan" }],
      transactions: [
        {
          id: "t-1",
          accountId: "1",
          amount: 100,
          date: "2024-06-15",
          description: "Baseline transaction",
        },
        {
          id: "t-2",
          accountId: "1",
          amount: 200,
          date: "2024-06-16",
          description: "Scenario transaction",
          scenarioId: "scenario-1",
        },
      ],
      selectedScenarioIds: new Set(),
    });

    expect(await page.findText(/Baseline transaction/)).toBeInTheDocument();
    expect(page.queryText(/Scenario transaction/)).not.toBeInTheDocument();
  });

  it("shows only baseline recurring transactions when activeScenarioId is null", async () => {
    const page = ScenarioTransactionListPage.render({
      accounts: [{ id: "1", name: "Checking", type: AccountType.Asset }],
      scenarios: [{ id: "scenario-1", name: "Base Plan" }],
      recurringTransactions: [
        {
          id: "rt-1",
          accountId: "1",
          amount: 100,
          description: "Baseline recurring",
          frequency: RecurrenceFrequency.Monthly,
          startDate: "2024-01-01",
        },
        {
          id: "rt-2",
          accountId: "1",
          amount: 200,
          description: "Scenario recurring",
          frequency: RecurrenceFrequency.Monthly,
          startDate: "2024-01-01",
          scenarioId: "scenario-1",
        },
      ],
      selectedScenarioIds: new Set(),
    });

    expect(await page.findText(/Baseline recurring/)).toBeInTheDocument();
    expect(page.queryText(/Scenario recurring/)).not.toBeInTheDocument();
  });

  it("shows all transactions regardless of isProjected flag", async () => {
    const page = ScenarioTransactionListPage.render({
      accounts: [{ id: "1", name: "Checking", type: AccountType.Asset }],
      scenarios: [{ id: "scenario-1", name: "Base Plan" }],
      transactions: [
        {
          id: "t-1",
          accountId: "1",
          amount: 100,
          date: "2024-01-15",
          description: "Past transaction",
          isProjected: false,
          scenarioId: "scenario-1",
        },
        {
          id: "t-2",
          accountId: "1",
          amount: 200,
          date: "2024-06-15",
          description: "Future transaction",
          isProjected: true,
          scenarioId: "scenario-1",
        },
      ],
      selectedScenarioIds: new Set(["scenario-1"]),
    });

    expect(await page.findText(/Past transaction/)).toBeInTheDocument();
    expect(screen.getByText(/Future transaction/)).toBeInTheDocument();
  });

  it("shows scenario icon for scenario transactions", async () => {
    const page = ScenarioTransactionListPage.render({
      accounts: [{ id: "1", name: "Checking", type: AccountType.Asset }],
      scenarios: [{ id: "scenario-1", name: "Early Retirement" }],
      transactions: [
        {
          id: "t-1",
          accountId: "1",
          amount: -30000,
          date: "2024-06-15",
          description: "New Car",
          scenarioId: "scenario-1",
        },
      ],
      selectedScenarioIds: new Set(["scenario-1"]),
    });

    expect(await page.findText(/New Car/)).toBeInTheDocument();
    expect(await page.findScenarioLabel("Scenario: Early Retirement")).toBeInTheDocument();
  });

  it("does not show scenario icon for baseline transactions", async () => {
    const page = ScenarioTransactionListPage.render({
      accounts: [{ id: "1", name: "Checking", type: AccountType.Asset }],
      scenarios: [{ id: "scenario-1", name: "Early Retirement" }],
      transactions: [
        {
          id: "t-1",
          accountId: "1",
          amount: -200,
          date: "2024-06-15",
          description: "Groceries",
        },
      ],
      selectedScenarioIds: new Set(["scenario-1"]),
    });

    expect(await page.findText(/Groceries/)).toBeInTheDocument();
    expect(page.queryScenarioLabel(/^Scenario:/)).not.toBeInTheDocument();
  });

  it("does not show scenario icon for deleted scenario", async () => {
    const page = ScenarioTransactionListPage.render({
      accounts: [{ id: "1", name: "Checking", type: AccountType.Asset }],
      scenarios: [{ id: "scenario-1", name: "Early Retirement" }],
      transactions: [
        {
          id: "t-1",
          accountId: "1",
          amount: -30000,
          date: "2024-06-15",
          description: "New Car",
          scenarioId: "deleted-scenario-id",
        },
      ],
      selectedScenarioIds: new Set(["deleted-scenario-id"]),
    });

    expect(await page.findText(/New Car/)).toBeInTheDocument();
    expect(page.queryScenarioLabel(/^Scenario:/)).not.toBeInTheDocument();
  });
});

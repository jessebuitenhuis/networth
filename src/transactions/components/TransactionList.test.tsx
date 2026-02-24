import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { RecurrenceFrequency } from "@/recurring-transactions/RecurrenceFrequency";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import type { Scenario } from "@/scenarios/Scenario.type";
import { mockApiResponses } from "@/test/mocks/mockApiResponses";
import type { Transaction } from "@/transactions/Transaction.type";

import { TransactionListPage } from "./TransactionList.page";

const transactions: Transaction[] = [
  { id: "t1", accountId: "a1", amount: 1000, date: "2024-01-15", description: "Opening balance" },
  { id: "t2", accountId: "a1", amount: -200, date: "2024-01-20", description: "Groceries" },
  { id: "t3", accountId: "a1", amount: 500, date: "2024-01-18", description: "Salary" },
];

describe("TransactionList", () => {
  beforeEach(() => mockApiResponses());

  it("shows empty message when no transactions", () => {
    const page = TransactionListPage.render({ accountId: "a1" });
    expect(page.emptyMessage).toBeInTheDocument();
  });

  it("lists transactions sorted by date newest first", async () => {
    const page = TransactionListPage.render({ accountId: "a1", transactions });

    const dataRows = await page.findRows();
    expect(dataRows).toHaveLength(3);
    expect(dataRows[0]).toHaveTextContent("Groceries");
    expect(dataRows[1]).toHaveTextContent("Salary");
    expect(dataRows[2]).toHaveTextContent("Opening balance");
  });

  it("displays date, description, and formatted amount", async () => {
    const page = TransactionListPage.render({ accountId: "a1", transactions: [transactions[0]] });

    expect(await page.findText("Opening balance")).toBeInTheDocument();
    const formattedDate = new Date("2024-01-15T00:00:00").toLocaleDateString("en-US");
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
    expect(screen.getByText("+$1,000.00")).toBeInTheDocument();
  });

  it("shows positive amounts in green", async () => {
    TransactionListPage.render({ accountId: "a1", transactions: [transactions[0]] });

    const amount = await screen.findByText("+$1,000.00");
    expect(amount).toHaveClass("text-positive");
  });

  it("shows negative amounts in red", async () => {
    TransactionListPage.render({ accountId: "a1", transactions: [transactions[1]] });

    const amount = await screen.findByText("-$200.00");
    expect(amount).toHaveClass("text-negative");
  });

  it("shows edit button for each transaction", async () => {
    const page = TransactionListPage.render({ accountId: "a1", transactions: [transactions[0]] });

    expect(await page.findEditButton()).toBeInTheDocument();
  });

  it("renders future-dated transaction with dashed border", async () => {
    const futureTransactions: Transaction[] = [
      { id: "t1", accountId: "a1", amount: 1000, date: "2099-01-01", description: "Future tx" },
    ];
    TransactionListPage.render({ accountId: "a1", transactions: futureTransactions });

    await screen.findByText("Future tx");
    const rows = document.querySelectorAll("[data-slot='table-row']");
    const dataRow = rows[1]; // Skip header row
    expect(dataRow).toHaveClass("border-dashed");
  });

  it("only shows transactions for the given account", async () => {
    const mixedTransactions = [
      ...transactions,
      { id: "t4", accountId: "a2", amount: 9999, date: "2024-01-25", description: "Other account" },
    ];
    const page = TransactionListPage.render({ accountId: "a1", transactions: mixedTransactions });

    const dataRows = await page.findRows();
    expect(dataRows).toHaveLength(3);
    expect(page.queryText("Other account")).not.toBeInTheDocument();
  });

  it("shows next recurring occurrence in the list", async () => {
    const recurringTransactions: RecurringTransaction[] = [
      {
        id: "r1",
        accountId: "a1",
        amount: 5000,
        description: "Monthly Salary",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2024-01-15",
      },
    ];
    const page = TransactionListPage.render({ accountId: "a1", recurringTransactions });

    expect(await page.findText("Monthly Salary")).toBeInTheDocument();
    expect(screen.getByText("Recurring")).toBeInTheDocument();
  });

  it("sorts recurring occurrence among regular transactions by date", async () => {
    // Use a date far in the future so the next occurrence is predictable
    const recurringTransactions: RecurringTransaction[] = [
      {
        id: "r1",
        accountId: "a1",
        amount: 5000,
        description: "Monthly Salary",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2099-06-15",
      },
    ];
    const txs: Transaction[] = [
      { id: "t1", accountId: "a1", amount: 100, date: "2099-07-01", description: "Future tx" },
    ];
    const page = TransactionListPage.render({ accountId: "a1", transactions: txs, recurringTransactions });

    const dataRows = await page.findRows();
    expect(dataRows).toHaveLength(2);
    // Future tx (2099-07-01) is newer, so appears first
    expect(dataRows[0]).toHaveTextContent("Future tx");
    expect(dataRows[1]).toHaveTextContent("Monthly Salary");
  });

  it("shows edit button for recurring transaction", async () => {
    const recurringTransactions: RecurringTransaction[] = [
      {
        id: "r1",
        accountId: "a1",
        amount: 5000,
        description: "Monthly Salary",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2024-01-15",
      },
    ];
    const page = TransactionListPage.render({ accountId: "a1", recurringTransactions });

    expect(await page.findEditButton()).toBeInTheDocument();
  });

  it("does not show ended recurring transaction", async () => {
    const recurringTransactions: RecurringTransaction[] = [
      {
        id: "r1",
        accountId: "a1",
        amount: 5000,
        description: "Expired Salary",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2020-01-15",
        endDate: "2020-06-01",
      },
    ];
    const page = TransactionListPage.render({ accountId: "a1", recurringTransactions });

    expect(page.emptyMessage).toBeInTheDocument();
  });

  it("does not show recurring transaction for a different account", async () => {
    const recurringTransactions: RecurringTransaction[] = [
      {
        id: "r1",
        accountId: "a2",
        amount: 5000,
        description: "Other Account Salary",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2024-01-15",
      },
    ];
    const page = TransactionListPage.render({ accountId: "a1", recurringTransactions });

    expect(page.emptyMessage).toBeInTheDocument();
  });

  it("hides account column in single-account view", async () => {
    const page = TransactionListPage.render({ accountId: "a1", transactions });

    await page.findText("Groceries");
    expect(page.queryColumnHeader(/Account/)).not.toBeInTheDocument();
  });

  it("shows scenario icon for transactions with a scenarioId", async () => {
    const scenarios: Scenario[] = [{ id: "s1", name: "Early Retirement", description: "" }];
    const scenarioTransactions: Transaction[] = [
      { id: "t1", accountId: "a1", amount: -30000, date: "2024-01-15", description: "New Car", scenarioId: "s1" },
    ];
    const page = TransactionListPage.render({
      accountId: "a1",
      transactions: scenarioTransactions,
      scenarios,
      activeScenarioId: "s1",
    });

    expect(await page.findScenarioLabel("Scenario: Early Retirement")).toBeInTheDocument();
  });

  it("does not show scenario icon for baseline transactions", async () => {
    const baselineTransactions: Transaction[] = [
      { id: "t1", accountId: "a1", amount: -200, date: "2024-01-15", description: "Groceries" },
    ];
    const page = TransactionListPage.render({ accountId: "a1", transactions: baselineTransactions });

    await page.findText("Groceries");
    expect(page.queryScenarioLabel(/^Scenario:/)).not.toBeInTheDocument();
  });

  it("does not show scenario icon when scenario was deleted", async () => {
    const orphanScenarioTransactions: Transaction[] = [
      { id: "t1", accountId: "a1", amount: -30000, date: "2024-01-15", description: "New Car", scenarioId: "deleted-scenario" },
    ];
    const dummyScenarios: Scenario[] = [{ id: "dummy", name: "Dummy", description: "" }];
    const page = TransactionListPage.render({
      accountId: "a1",
      transactions: orphanScenarioTransactions,
      scenarios: dummyScenarios,
      activeScenarioId: "deleted-scenario",
    });

    await page.findText("New Car");
    expect(page.queryScenarioLabel(/^Scenario:/)).not.toBeInTheDocument();
  });

  it("shows only baseline transactions when activeScenarioId is null", async () => {
    const scenarios: Scenario[] = [{ id: "s1", name: "Scenario 1", description: "" }];
    const mixedTransactions: Transaction[] = [
      { id: "t1", accountId: "a1", amount: 100, date: "2024-01-15", description: "Baseline tx" },
      { id: "t2", accountId: "a1", amount: 200, date: "2024-01-16", description: "Scenario tx", scenarioId: "s1" },
    ];
    const page = TransactionListPage.render({
      accountId: "a1",
      transactions: mixedTransactions,
      scenarios,
      activeScenarioId: null,
    });

    expect(await page.findText("Baseline tx")).toBeInTheDocument();
    expect(page.queryText("Scenario tx")).not.toBeInTheDocument();
  });

  it("shows baseline + scenario transactions when activeScenarioId is set", async () => {
    const scenarios: Scenario[] = [
      { id: "s1", name: "Scenario 1", description: "" },
      { id: "s2", name: "Scenario 2", description: "" },
    ];
    const mixedTransactions: Transaction[] = [
      { id: "t1", accountId: "a1", amount: 100, date: "2024-01-15", description: "Baseline tx" },
      { id: "t2", accountId: "a1", amount: 200, date: "2024-01-16", description: "Scenario 1 tx", scenarioId: "s1" },
      { id: "t3", accountId: "a1", amount: 300, date: "2024-01-17", description: "Scenario 2 tx", scenarioId: "s2" },
    ];
    const page = TransactionListPage.render({
      accountId: "a1",
      transactions: mixedTransactions,
      scenarios,
      activeScenarioId: "s1",
    });

    expect(await page.findText("Baseline tx")).toBeInTheDocument();
    expect(screen.getByText("Scenario 1 tx")).toBeInTheDocument();
    expect(page.queryText("Scenario 2 tx")).not.toBeInTheDocument();
  });
});

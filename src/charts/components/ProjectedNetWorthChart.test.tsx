import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Account } from "@/accounts/Account.type";
import { AccountType } from "@/accounts/AccountType";
import type { Goal } from "@/goals/Goal.type";
import { RecurrenceFrequency } from "@/recurring-transactions/RecurrenceFrequency";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import type { Scenario } from "@/scenarios/Scenario.type";
import { mockApiResponses } from "@/test/mocks/mockApiResponses";
import { mockResizeObserver } from "@/test/mocks/mockResizeObserver";
import { suppressRechartsWarnings } from "@/test/mocks/suppressRechartsWarnings";
import type { Transaction } from "@/transactions/Transaction.type";

import { ProjectedNetWorthChartPage as Page } from "./ProjectedNetWorthChart.page";

mockResizeObserver();
suppressRechartsWarnings();

const CHECKING: Account = { id: "1", name: "Checking", type: AccountType.Asset };

describe("ProjectedNetWorthChart", () => {
  beforeEach(() => {
    mockApiResponses();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders with 1M selected by default", () => {
    const page = Page.render();

    expect(page.periodButtonPressed("1M")).toBe("true");
  });

  it("switches period on button click", async () => {
    const page = Page.render();

    await page.selectPeriod("1Y");

    expect(page.periodButtonPressed("1Y")).toBe("true");
    expect(page.periodButtonPressed("1M")).toBe("false");
  });

  it("renders the chart container", () => {
    const page = Page.render();

    expect(page.chartContainer).toBeInTheDocument();
  });

  it("does not show custom date range picker by default", () => {
    const page = Page.render();

    expect(page.queryStartInput()).not.toBeInTheDocument();
  });

  it("shows custom date range picker when Custom is selected", async () => {
    const page = Page.render();

    await page.selectPeriod("Custom");

    expect(page.getStartInput()).toBeInTheDocument();
    expect(page.getEndInput()).toBeInTheDocument();
  });

  it("updates custom range when date inputs change", async () => {
    const page = Page.render();

    await page.selectPeriod("Custom");

    await page.clearAndType(page.getStartInput(), "2024-01-01");
    await page.clearAndType(page.getEndInput(), "2024-12-31");

    expect(page.getStartInput()).toHaveValue("2024-01-01");
    expect(page.getEndInput()).toHaveValue("2024-12-31");
  });

  it("renders baseline only when no scenarios selected", () => {
    const page = Page.render({ accounts: [CHECKING] });

    expect(page.chartContainer).toBeInTheDocument();
    expect(page.legendText("Baseline")).toBeInTheDocument();
  });

  it("renders scenario legend when scenario is selected", async () => {
    const scenarios: Scenario[] = [{ id: "scenario-1", name: "Optimistic" }];

    const page = Page.render({
      accounts: [CHECKING],
      scenarios,
      selectedScenarioIds: new Set(["scenario-1"]),
    });

    expect(await page.findLegendText("Optimistic")).toBeInTheDocument();
    expect(page.legendText("Baseline")).toBeInTheDocument();
  });

  it("filters accounts based on excludedAccountIds prop", () => {
    const accounts: Account[] = [
      CHECKING,
      { id: "2", name: "Savings", type: AccountType.Asset },
    ];

    const page = Page.render({ accounts, excludedAccountIds: new Set(["2"]) });

    expect(page.chartContainer).toBeInTheDocument();
  });

  it("includes scenario transactions when scenario is selected", () => {
    const scenarios: Scenario[] = [{ id: "scenario-1", name: "Optimistic" }];
    const transactions: Transaction[] = [
      { id: "t-1", accountId: "1", amount: 1000, date: "2024-06-01", description: "Baseline transaction" },
      { id: "t-2", accountId: "1", amount: 2000, date: "2024-07-01", description: "Scenario transaction", scenarioId: "scenario-1" },
    ];

    const page = Page.render({
      accounts: [CHECKING],
      transactions,
      scenarios,
      selectedScenarioIds: new Set(["scenario-1"]),
    });

    expect(page.chartContainer).toBeInTheDocument();
  });

  it("includes scenario recurring transactions when scenario is selected", () => {
    const scenarios: Scenario[] = [{ id: "scenario-1", name: "Optimistic" }];
    const recurringTransactions: RecurringTransaction[] = [
      { id: "rt-1", accountId: "1", amount: 100, description: "Baseline recurring", frequency: RecurrenceFrequency.Monthly, startDate: "2024-01-01" },
      { id: "rt-2", accountId: "1", amount: 200, description: "Scenario recurring", frequency: RecurrenceFrequency.Monthly, startDate: "2024-01-01", scenarioId: "scenario-1" },
    ];

    const page = Page.render({
      accounts: [CHECKING],
      recurringTransactions,
      scenarios,
      selectedScenarioIds: new Set(["scenario-1"]),
    });

    expect(page.chartContainer).toBeInTheDocument();
  });

  it("renders empty scenario legend when no scenarios selected", () => {
    const page = Page.render({ accounts: [CHECKING] });

    expect(page.legendText("Baseline")).toBeInTheDocument();
  });

  it("renders multiple scenarios in legend when multiple selected", async () => {
    const scenarios: Scenario[] = [
      { id: "scenario-1", name: "Optimistic" },
      { id: "scenario-2", name: "Pessimistic" },
    ];

    const page = Page.render({
      accounts: [CHECKING],
      scenarios,
      selectedScenarioIds: new Set(["scenario-1", "scenario-2"]),
    });

    expect(await page.findLegendText("Optimistic")).toBeInTheDocument();
    expect(page.legendText("Baseline")).toBeInTheDocument();
    expect(page.legendText("Pessimistic")).toBeInTheDocument();
  });

  it("renders goal names in legend when goals exist", async () => {
    const goals: Goal[] = [
      { id: "goal-1", name: "Emergency Fund", targetAmount: 10000 },
      { id: "goal-2", name: "House Down Payment", targetAmount: 50000 },
    ];

    const page = Page.render({ accounts: [CHECKING], goals });

    expect(await page.findLegendText("Emergency Fund")).toBeInTheDocument();
    expect(page.legendText("House Down Payment")).toBeInTheDocument();
  });

  it("does not render goal entries in legend when no goals exist", () => {
    const page = Page.render({ accounts: [CHECKING] });

    expect(page.legendText("Baseline")).toBeInTheDocument();
    expect(page.queryLegendText("Emergency Fund")).not.toBeInTheDocument();
  });

  it("renders chart container when goals exist", () => {
    const goals: Goal[] = [
      { id: "goal-1", name: "Emergency Fund", targetAmount: 10000 },
    ];

    const page = Page.render({ accounts: [CHECKING], goals });

    expect(page.chartContainer).toBeInTheDocument();
  });

  describe("navigation arrows", () => {
    it("shows navigation arrows for fixed periods", () => {
      const page = Page.render();

      expect(page.previousButton).toBeInTheDocument();
      expect(page.nextButton).toBeInTheDocument();
    });

    it("hides navigation arrows for All period", async () => {
      const page = Page.render();

      await page.selectPeriod("All");

      expect(page.queryPreviousButton()).not.toBeInTheDocument();
      expect(page.queryNextButton()).not.toBeInTheDocument();
    });

    it("hides navigation arrows for Custom period", async () => {
      const page = Page.render();

      await page.selectPeriod("Custom");

      expect(page.queryPreviousButton()).not.toBeInTheDocument();
      expect(page.queryNextButton()).not.toBeInTheDocument();
    });

    it("navigating forward and backward renders without error", async () => {
      const page = Page.render({ accounts: [CHECKING] });

      await page.clickNext();
      expect(page.chartContainer).toBeInTheDocument();

      await page.clickPrevious();
      expect(page.chartContainer).toBeInTheDocument();
    });

    it("resets navigation offset when switching periods", async () => {
      const page = Page.render({ accounts: [CHECKING] });

      await page.clickNext();
      await page.selectPeriod("1W");

      expect(page.chartContainer).toBeInTheDocument();
      expect(page.periodButtonPressed("1W")).toBe("true");
    });
  });
});

import { beforeEach, describe, expect, it } from "vitest";

import type { Account } from "@/accounts/Account.type";
import { AccountType } from "@/accounts/AccountType";
import {
  formatChartCurrency as formatCurrency,
  formatTooltipLabel,
  formatTooltipValue,
  formatXAxisTick,
  formatYAxisValue,
} from "@/charts/chartFormatters";
import { mockApiResponses } from "@/test/mocks/mockApiResponses";
import { mockResizeObserver } from "@/test/mocks/mockResizeObserver";
import { suppressRechartsWarnings } from "@/test/mocks/suppressRechartsWarnings";
import type { Transaction } from "@/transactions/Transaction.type";

import { NetWorthChartPage } from "./NetWorthChart.page";

mockResizeObserver();
suppressRechartsWarnings();

describe("formatCurrency", () => {
  it("formats positive amounts", () => {
    expect(formatCurrency(1234)).toBe("$1,234");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0");
  });

  it("formats negative amounts", () => {
    expect(formatCurrency(-5000)).toBe("-$5,000");
  });
});

describe("formatXAxisTick", () => {
  it("formats date with weekday format", () => {
    const result = formatXAxisTick("2024-01-15", "weekday");
    expect(result).toBeTruthy();
  });

  it("formats date with dayMonth format", () => {
    const result = formatXAxisTick("2024-01-15", "dayMonth");
    expect(result).toBeTruthy();
  });

  it("formats date with monthYear format", () => {
    const result = formatXAxisTick("2024-01-15", "monthYear");
    expect(result).toBeTruthy();
  });
});

describe("formatYAxisValue", () => {
  it("formats positive values as currency", () => {
    expect(formatYAxisValue(1000)).toBe("$1,000");
  });

  it("formats negative values as currency", () => {
    expect(formatYAxisValue(-500)).toBe("-$500");
  });
});

describe("formatTooltipLabel", () => {
  it("formats date label with weekday format", () => {
    const result = formatTooltipLabel("2024-01-15", "weekday");
    expect(result).toBeTruthy();
  });

  it("formats date label with dayMonth format", () => {
    const result = formatTooltipLabel("2024-01-15", "dayMonth");
    expect(result).toBeTruthy();
  });

  it("formats date label with monthYear format", () => {
    const result = formatTooltipLabel("2024-01-15", "monthYear");
    expect(result).toBeTruthy();
  });
});

describe("formatTooltipValue", () => {
  it("formats tooltip value as currency", () => {
    expect(formatTooltipValue(2500)).toBe("$2,500");
  });

  it("formats negative tooltip value as currency", () => {
    expect(formatTooltipValue(-1500)).toBe("-$1,500");
  });
});

describe("NetWorthChart", () => {
  beforeEach(() => mockApiResponses());

  it("renders the period picker with 1M selected by default", () => {
    const page = NetWorthChartPage.render();

    expect(page.periodButton("1M")).toHaveAttribute("aria-pressed", "true");
  });

  it("switches period on button click", async () => {
    const page = NetWorthChartPage.render();

    await page.selectPeriod("1Y");

    expect(page.periodButton("1Y")).toHaveAttribute("aria-pressed", "true");
    expect(page.periodButton("1M")).toHaveAttribute("aria-pressed", "false");
  });

  it("renders the chart container", () => {
    const page = NetWorthChartPage.render();

    expect(page.chartContainer).toBeInTheDocument();
  });

  it("renders without crashing with no transactions", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
    ];
    const page = NetWorthChartPage.render({ accounts });

    expect(page.chartContainer).toBeInTheDocument();
  });

  it("renders without crashing with transactions", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
    ];
    const transactions: Transaction[] = [
      { id: "t1", accountId: "1", amount: 1000, date: "2024-01-01", description: "Opening" },
    ];
    const page = NetWorthChartPage.render({ accounts, transactions });

    expect(page.chartContainer).toBeInTheDocument();
  });

  it("renders legend with account names as buttons", async () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
      { id: "2", name: "Savings", type: AccountType.Asset },
    ];
    const page = NetWorthChartPage.render({ accounts });

    expect(await page.findAccountButton("Checking")).toBeInTheDocument();
    expect(page.accountButton("Savings")).toBeInTheDocument();
  });

  it("has all accounts enabled by default", async () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
      { id: "2", name: "Savings", type: AccountType.Asset },
    ];
    const page = NetWorthChartPage.render({ accounts });

    expect(await page.findAccountButton("Checking")).toHaveAttribute("aria-pressed", "true");
    expect(page.accountButton("Savings")).toHaveAttribute("aria-pressed", "true");
  });

  it("toggles an account off when clicked", async () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
      { id: "2", name: "Savings", type: AccountType.Asset },
    ];
    const page = NetWorthChartPage.render({ accounts });

    await page.findAccountButton("Savings");
    await page.toggleAccount("Savings");

    expect(page.accountButton("Savings")).toHaveAttribute("aria-pressed", "false");
    expect(page.accountButton("Checking")).toHaveAttribute("aria-pressed", "true");
  });

  it("toggles an account back on when clicked again", async () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
      { id: "2", name: "Savings", type: AccountType.Asset },
    ];
    const page = NetWorthChartPage.render({ accounts });

    await page.findAccountButton("Savings");
    await page.toggleAccount("Savings");
    await page.toggleAccount("Savings");

    expect(page.accountButton("Savings")).toHaveAttribute("aria-pressed", "true");
  });

  it("switches to 1W period", async () => {
    const page = NetWorthChartPage.render();

    await page.selectPeriod("1W");

    expect(page.periodButton("1W")).toHaveAttribute("aria-pressed", "true");
    expect(page.periodButton("1M")).toHaveAttribute("aria-pressed", "false");
  });

  it("switches to 3M period", async () => {
    const page = NetWorthChartPage.render();

    await page.selectPeriod("3M");

    expect(page.periodButton("3M")).toHaveAttribute("aria-pressed", "true");
    expect(page.periodButton("1M")).toHaveAttribute("aria-pressed", "false");
  });

  it("shows custom date range picker when Custom is selected", async () => {
    const page = NetWorthChartPage.render();

    await page.selectPeriod("Custom");

    expect(page.startInput).toBeInTheDocument();
    expect(page.endInput).toBeInTheDocument();
  });

  it("does not show custom date range picker by default", () => {
    const page = NetWorthChartPage.render();

    expect(page.queryStartInput()).not.toBeInTheDocument();
  });
});

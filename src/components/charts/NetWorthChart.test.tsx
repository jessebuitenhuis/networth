import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import type { Account } from "@/accounts/Account.type";
import { AccountProvider } from "@/accounts/AccountContext";
import { AccountType } from "@/accounts/AccountType";
import { mockResizeObserver } from "@/test/mocks/mockResizeObserver";
import { suppressRechartsWarnings } from "@/test/mocks/suppressRechartsWarnings";
import type { Transaction } from "@/transactions/Transaction.type";
import { TransactionProvider } from "@/transactions/TransactionContext";

import {
  formatCurrency,
  formatTooltipLabel,
  formatTooltipValue,
  formatXAxisTick,
  formatYAxisValue,
  NetWorthChart,
} from "./NetWorthChart";

mockResizeObserver();
suppressRechartsWarnings();

function renderWithProviders(
  accounts: Account[] = [],
  transactions: Transaction[] = []
) {
  localStorage.setItem("accounts", JSON.stringify(accounts));
  localStorage.setItem("transactions", JSON.stringify(transactions));
  return render(
    <AccountProvider>
      <TransactionProvider>
        <NetWorthChart />
      </TransactionProvider>
    </AccountProvider>
  );
}

describe("formatCurrency", () => {
  it("formats positive amounts", () => {
    expect(formatCurrency(1234)).toBe("US$1,234");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("US$0");
  });

  it("formats negative amounts", () => {
    expect(formatCurrency(-5000)).toBe("-US$5,000");
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
    expect(formatYAxisValue(1000)).toBe("US$1,000");
  });

  it("formats negative values as currency", () => {
    expect(formatYAxisValue(-500)).toBe("-US$500");
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
    expect(formatTooltipValue(2500)).toBe("US$2,500");
  });

  it("formats negative tooltip value as currency", () => {
    expect(formatTooltipValue(-1500)).toBe("-US$1,500");
  });
});

describe("NetWorthChart", () => {
  beforeEach(() => localStorage.clear());

  it("renders the period picker with 1M selected by default", () => {
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

    expect(screen.getByTestId("net-worth-chart")).toBeInTheDocument();
  });

  it("renders without crashing with no transactions", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
    ];
    renderWithProviders(accounts);

    expect(screen.getByTestId("net-worth-chart")).toBeInTheDocument();
  });

  it("renders without crashing with transactions", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
    ];
    const transactions: Transaction[] = [
      { id: "t1", accountId: "1", amount: 1000, date: "2024-01-01", description: "Opening" },
    ];
    renderWithProviders(accounts, transactions);

    expect(screen.getByTestId("net-worth-chart")).toBeInTheDocument();
  });

  it("renders legend with account names as buttons", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
      { id: "2", name: "Savings", type: AccountType.Asset },
    ];
    renderWithProviders(accounts);

    expect(screen.getByRole("button", { name: "Checking" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Savings" })).toBeInTheDocument();
  });

  it("has all accounts enabled by default", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
      { id: "2", name: "Savings", type: AccountType.Asset },
    ];
    renderWithProviders(accounts);

    expect(screen.getByRole("button", { name: "Checking" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Savings" })).toHaveAttribute("aria-pressed", "true");
  });

  it("toggles an account off when clicked", async () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
      { id: "2", name: "Savings", type: AccountType.Asset },
    ];
    renderWithProviders(accounts);

    await userEvent.click(screen.getByRole("button", { name: "Savings" }));

    expect(screen.getByRole("button", { name: "Savings" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Checking" })).toHaveAttribute("aria-pressed", "true");
  });

  it("toggles an account back on when clicked again", async () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
      { id: "2", name: "Savings", type: AccountType.Asset },
    ];
    renderWithProviders(accounts);

    await userEvent.click(screen.getByRole("button", { name: "Savings" }));
    await userEvent.click(screen.getByRole("button", { name: "Savings" }));

    expect(screen.getByRole("button", { name: "Savings" })).toHaveAttribute("aria-pressed", "true");
  });

  it("switches to 1W period", async () => {
    renderWithProviders();

    await userEvent.click(screen.getByRole("button", { name: "1W" }));

    expect(screen.getByRole("button", { name: "1W" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "1M" })).toHaveAttribute("aria-pressed", "false");
  });

  it("switches to 3M period", async () => {
    renderWithProviders();

    await userEvent.click(screen.getByRole("button", { name: "3M" }));

    expect(screen.getByRole("button", { name: "3M" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "1M" })).toHaveAttribute("aria-pressed", "false");
  });

  it("shows custom date range picker when Custom is selected", async () => {
    renderWithProviders();
    await userEvent.click(screen.getByRole("button", { name: "Custom" }));
    expect(screen.getByLabelText("Start")).toBeInTheDocument();
    expect(screen.getByLabelText("End")).toBeInTheDocument();
  });

  it("does not show custom date range picker by default", () => {
    renderWithProviders();
    expect(screen.queryByLabelText("Start")).not.toBeInTheDocument();
  });
});

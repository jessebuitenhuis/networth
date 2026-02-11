import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NetWorthChart, formatCurrency } from "./NetWorthChart";
import { AccountType } from "@/models/AccountType";
import type { Account } from "@/models/Account";
import type { Transaction } from "@/models/Transaction";
import { AccountProvider } from "@/context/AccountContext";
import { TransactionProvider } from "@/context/TransactionContext";

// Recharts uses ResizeObserver which jsdom doesn't provide
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
    expect(formatCurrency(1234)).toBe("$1,234");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0");
  });

  it("formats negative amounts", () => {
    expect(formatCurrency(-5000)).toBe("-$5,000");
  });
});

describe("NetWorthChart", () => {
  beforeEach(() => localStorage.clear());

  it("renders the period picker with Month selected by default", () => {
    renderWithProviders();

    expect(screen.getByRole("button", { name: "Month" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("switches period on button click", async () => {
    renderWithProviders();

    await userEvent.click(screen.getByRole("button", { name: "Year" }));

    expect(screen.getByRole("button", { name: "Year" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Month" })).toHaveAttribute(
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
});

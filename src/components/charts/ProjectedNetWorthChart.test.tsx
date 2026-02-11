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
        <RecurringTransactionProvider>
          <ProjectedNetWorthChart />
        </RecurringTransactionProvider>
      </TransactionProvider>
    </AccountProvider>
  );
}

describe("ProjectedNetWorthChart", () => {
  beforeEach(() => localStorage.clear());

  it("renders with 3M selected by default", () => {
    renderWithProviders();

    expect(screen.getByRole("button", { name: "3M" })).toHaveAttribute(
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
    expect(screen.getByRole("button", { name: "3M" })).toHaveAttribute(
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
});

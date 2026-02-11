import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { NetWorthSummary } from "./NetWorthSummary";
import { AccountType } from "@/models/AccountType";
import type { Account } from "@/models/Account";
import { AccountProvider } from "@/context/AccountContext";

function renderWithProvider(accounts: Account[] = []) {
  localStorage.setItem("accounts", JSON.stringify(accounts));
  return render(
    <AccountProvider>
      <NetWorthSummary />
    </AccountProvider>
  );
}

describe("NetWorthSummary", () => {
  beforeEach(() => localStorage.clear());

  it("displays $0.00 with no accounts", () => {
    renderWithProvider();
    expect(screen.getByText("$0.00")).toBeInTheDocument();
  });

  it("displays sum of assets minus liabilities", async () => {
    renderWithProvider([
      { id: "1", name: "Checking", type: AccountType.Asset, balance: 5000 },
      { id: "2", name: "Savings", type: AccountType.Asset, balance: 3000 },
      { id: "3", name: "Credit Card", type: AccountType.Liability, balance: 1500 },
    ]);

    expect(await screen.findByText("$6,500.00")).toBeInTheDocument();
  });

  it("displays negative net worth", async () => {
    renderWithProvider([
      { id: "1", name: "Checking", type: AccountType.Asset, balance: 500 },
      { id: "2", name: "Loan", type: AccountType.Liability, balance: 2000 },
    ]);

    expect(await screen.findByText("-$1,500.00")).toBeInTheDocument();
  });

  it("has a heading", () => {
    renderWithProvider();
    expect(screen.getByText("Net Worth")).toBeInTheDocument();
  });
});

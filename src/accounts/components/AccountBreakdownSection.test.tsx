import { afterEach, describe, expect, it, vi } from "vitest";

import { AccountType } from "@/accounts/AccountType";

import { AccountBreakdownSectionPage } from "./AccountBreakdownSection.page";

const accounts = [
  { id: "1", name: "Checking", type: AccountType.Asset },
  { id: "2", name: "Savings", type: AccountType.Asset },
  { id: "3", name: "Credit Card", type: AccountType.Liability },
];

const transactions = [
  { id: "t1", accountId: "1", amount: 5000, date: "2024-01-01", description: "Opening" },
  { id: "t2", accountId: "2", amount: 3000, date: "2024-01-01", description: "Opening" },
  { id: "t3", accountId: "3", amount: 1500, date: "2024-01-01", description: "Opening" },
];

describe("AccountBreakdownSection", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing when there are no accounts", () => {
    const page = AccountBreakdownSectionPage.render();
    expect(page.queryByText("Assets")).not.toBeInTheDocument();
    expect(page.queryByText("Liabilities")).not.toBeInTheDocument();
  });

  it("renders the Assets section with accounts", async () => {
    const page = AccountBreakdownSectionPage.render(accounts, transactions);
    expect(await page.findByText("Assets")).toBeInTheDocument();
    expect(page.getByText("Checking")).toBeInTheDocument();
    expect(page.getByText("Savings")).toBeInTheDocument();
  });

  it("renders the Liabilities section with accounts", async () => {
    const page = AccountBreakdownSectionPage.render(accounts, transactions);
    expect(await page.findByText("Liabilities")).toBeInTheDocument();
    expect(page.getByText("Credit Card")).toBeInTheDocument();
  });

  it("does not render Liabilities section when there are none", async () => {
    const assetOnly = [{ id: "1", name: "Checking", type: AccountType.Asset }];
    const page = AccountBreakdownSectionPage.render(assetOnly, [
      { id: "t1", accountId: "1", amount: 1000, date: "2024-01-01", description: "Opening" },
    ]);
    expect(await page.findByText("Assets")).toBeInTheDocument();
    expect(page.queryByText("Liabilities")).not.toBeInTheDocument();
  });

  it("renders account balances", async () => {
    const page = AccountBreakdownSectionPage.render(accounts, transactions);
    expect(await page.findByText("$5,000.00")).toBeInTheDocument();
    expect(page.getByText("$3,000.00")).toBeInTheDocument();
    // $1,500.00 appears as both account balance and section subtotal
    expect(page.getAllByText("$1,500.00").length).toBeGreaterThanOrEqual(1);
  });

  it("renders section subtotals", async () => {
    const page = AccountBreakdownSectionPage.render(accounts, transactions);
    expect(await page.findByText("$8,000.00")).toBeInTheDocument();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Account } from "@/accounts/Account.type";
import { AccountType } from "@/accounts/AccountType";
import { mockApiResponses } from "@/test/mocks/mockApiResponses";
import type { Transaction } from "@/transactions/Transaction.type";

import { AccountsPageObject } from "./page.page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const accounts: Account[] = [
  { id: "a1", name: "Checking", type: AccountType.Asset },
  { id: "a2", name: "Savings", type: AccountType.Asset },
  { id: "a3", name: "Mortgage", type: AccountType.Liability },
  { id: "a4", name: "Car Loan", type: AccountType.Liability },
];

const transactions: Transaction[] = [
  { id: "t1", accountId: "a1", amount: 5000, date: "2024-01-01", description: "Opening" },
  { id: "t2", accountId: "a2", amount: 3000, date: "2024-01-01", description: "Opening" },
  { id: "t3", accountId: "a3", amount: 1234, date: "2024-01-01", description: "Opening" },
  { id: "t4", accountId: "a4", amount: 567, date: "2024-01-01", description: "Opening" },
];

describe("AccountsPage", () => {
  beforeEach(() => {
    mockApiResponses();
  });

  it("shows page title", async () => {
    const page = AccountsPageObject.render({ accounts, transactions });
    expect(await page.findHeading("Accounts")).toBeInTheDocument();
  });

  it("displays net worth summary card", async () => {
    const page = AccountsPageObject.render({ accounts, transactions });
    expect(await page.findText("Net Worth")).toBeInTheDocument();
    expect(await page.findText("$6,199.00")).toBeInTheDocument();
  });

  it("shows assets section with account names", async () => {
    const page = AccountsPageObject.render({ accounts, transactions });
    expect(await page.findText("Checking")).toBeInTheDocument();
    expect(await page.findText("Savings")).toBeInTheDocument();
  });

  it("shows liabilities section", async () => {
    const page = AccountsPageObject.render({ accounts, transactions });
    expect(await page.findText("Mortgage")).toBeInTheDocument();
  });

  it("shows individual account balances", async () => {
    const page = AccountsPageObject.render({ accounts, transactions });
    expect(await page.findText("$5,000.00")).toBeInTheDocument();
    expect(await page.findText("$3,000.00")).toBeInTheDocument();
    expect(await page.findText("$1,234.00")).toBeInTheDocument();
  });

  it("renders New Account button", async () => {
    const page = AccountsPageObject.render({ accounts, transactions });
    expect(await page.findButton("New Account")).toBeInTheDocument();
  });

  it("renders account links to detail pages", async () => {
    const page = AccountsPageObject.render({ accounts, transactions });
    const link = await page.findLink("Checking");
    expect(link).toHaveAttribute("href", "/accounts/a1");
  });

  it("renders edit buttons for accounts", async () => {
    const page = AccountsPageObject.render({ accounts, transactions });
    expect(await page.findButton("Edit Checking")).toBeInTheDocument();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Account } from "@/accounts/Account.type";
import { AccountType } from "@/accounts/AccountType";
import { mockApiResponses } from "@/test/mocks/mockApiResponses";
import type { Transaction } from "@/transactions/Transaction.type";

import { TransactionsPageObject } from "./page.page";

const accounts: Account[] = [
  { id: "a1", name: "Checking", type: AccountType.Asset },
  { id: "a2", name: "Savings", type: AccountType.Asset },
];

const transactions: Transaction[] = [
  { id: "t1", accountId: "a1", amount: 1000, date: "2024-01-01", description: "Paycheck" },
  { id: "t2", accountId: "a1", amount: -50, date: "2024-01-02", description: "Groceries" },
  { id: "t3", accountId: "a2", amount: 500, date: "2024-01-03", description: "Transfer" },
];

describe("TransactionsPage", () => {
  beforeEach(() => {
    mockApiResponses();
    vi.stubGlobal("crypto", { randomUUID: () => "test-uuid" });
  });

  it("shows page title", async () => {
    const page = TransactionsPageObject.render({ accounts, transactions });
    expect(await page.findHeading("Transactions")).toBeInTheDocument();
  });

  it("shows transactions from all accounts", async () => {
    const page = TransactionsPageObject.render({ accounts, transactions });
    expect(await page.findText("Paycheck")).toBeInTheDocument();
    expect(page.getText("Groceries")).toBeInTheDocument();
    expect(page.getText("Transfer")).toBeInTheDocument();
  });

  it("shows account names in the table", async () => {
    const page = TransactionsPageObject.render({ accounts, transactions });
    await page.findText("Paycheck");
    expect(page.getAllText("Checking").length).toBeGreaterThanOrEqual(1);
    expect(page.getText("Savings")).toBeInTheDocument();
  });

  it("shows empty message when no transactions exist", () => {
    const page = TransactionsPageObject.render({ accounts: [], transactions: [] });
    expect(page.getText("No transactions yet.")).toBeInTheDocument();
  });

  it("renders Add Transaction button", async () => {
    const page = TransactionsPageObject.render({ accounts, transactions });
    expect(await page.findButton("Add Transaction")).toBeInTheDocument();
  });

  it("shows search input for filtering", async () => {
    const page = TransactionsPageObject.render({ accounts, transactions });
    expect(await page.findSearchInput()).toBeInTheDocument();
  });

  it("filters transactions by description search", async () => {
    const page = TransactionsPageObject.render({ accounts, transactions });
    await page.findText("Paycheck");
    await page.typeInSearch("Grocer");

    expect(await page.findText("Showing 1 of 3 transactions")).toBeInTheDocument();
    expect(page.getText("Groceries")).toBeInTheDocument();
    expect(page.queryText("Paycheck")).not.toBeInTheDocument();
  });
});

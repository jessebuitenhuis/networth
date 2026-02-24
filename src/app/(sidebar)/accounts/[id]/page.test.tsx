import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Account } from "@/accounts/Account.type";
import { AccountType } from "@/accounts/AccountType";
import type { Scenario } from "@/scenarios/Scenario.type";
import { mockApiResponses } from "@/test/mocks/mockApiResponses";
import { mockResizeObserver } from "@/test/mocks/mockResizeObserver";
import { suppressActWarnings } from "@/test/mocks/suppressActWarnings";
import { suppressRechartsWarnings } from "@/test/mocks/suppressRechartsWarnings";
import type { Transaction } from "@/transactions/Transaction.type";

import { AccountDetailPageObject } from "./page.page";

mockResizeObserver();
suppressRechartsWarnings();
suppressActWarnings();

const accounts: Account[] = [
  { id: "a1", name: "Checking", type: AccountType.Asset },
];

const transactions: Transaction[] = [
  { id: "t1", accountId: "a1", amount: 1000, date: "2024-01-01", description: "Opening balance" },
  { id: "t2", accountId: "a1", amount: -200, date: "2024-01-02", description: "Groceries" },
];

describe("AccountDetailPage", () => {
  beforeEach(() => {
    mockApiResponses();
    vi.stubGlobal("crypto", { randomUUID: () => "test-uuid" });
  });

  it("shows account name as heading", async () => {
    const page = AccountDetailPageObject.render("a1", { accounts, transactions });

    expect(await page.findHeading("Checking")).toBeInTheDocument();
  });

  it("shows current balance computed from transactions", async () => {
    const page = AccountDetailPageObject.render("a1", { accounts, transactions });

    expect(await page.findText("$800.00")).toBeInTheDocument();
  });

  it("renders transaction list", async () => {
    const page = AccountDetailPageObject.render("a1", { accounts, transactions });

    expect(await page.findText("Opening balance")).toBeInTheDocument();
    expect(page.getText("Groceries")).toBeInTheDocument();
  });

  it("renders add transaction dialog trigger", async () => {
    const page = AccountDetailPageObject.render("a1", { accounts });

    expect(await page.findButton("Add Transaction")).toBeInTheDocument();
  });

  it("shows 'Account not found' for invalid ID", () => {
    const page = AccountDetailPageObject.render("nonexistent");

    expect(page.getText("Account not found")).toBeInTheDocument();
  });

  it("shows scenario filter in TopBar with 'Baseline only' default", async () => {
    const scenarios: Scenario[] = [
      { id: "s1", name: "Scenario 1", description: "" },
    ];
    const page = AccountDetailPageObject.render("a1", { accounts, transactions, scenarios });

    const filter = await page.findCombobox("Scenario filter");
    expect(filter).toHaveTextContent("Baseline only");
  });

  it("filters balance by selected scenario", async () => {
    const scenarios: Scenario[] = [
      { id: "s1", name: "Scenario 1", description: "" },
    ];
    const scenarioTransactions: Transaction[] = [
      { id: "t1", accountId: "a1", amount: 1000, date: "2024-01-01", description: "Baseline" },
      { id: "t2", accountId: "a1", amount: 500, date: "2024-01-02", description: "Scenario tx", scenarioId: "s1" },
    ];
    const page = AccountDetailPageObject.render("a1", { accounts, transactions: scenarioTransactions, scenarios });

    expect(await page.findText("$1,000.00")).toBeInTheDocument();

    const filter = page.getCombobox("Scenario filter");
    await page.clickElement(filter);

    const scenario1Option = page.getOption("Scenario 1");
    await page.clickElement(scenario1Option);

    expect(await page.findText("$1,500.00")).toBeInTheDocument();
  });

  it("handles deleted scenario gracefully (falls back to baseline)", async () => {
    const scenarios: Scenario[] = [
      { id: "s1", name: "Scenario 1", description: "" },
    ];
    const scenarioTransactions: Transaction[] = [
      { id: "t1", accountId: "a1", amount: 1000, date: "2024-01-01", description: "Baseline" },
      { id: "t2", accountId: "a1", amount: 500, date: "2024-01-02", description: "Deleted scenario tx", scenarioId: "deleted" },
    ];
    const page = AccountDetailPageObject.render("a1", { accounts, transactions: scenarioTransactions, scenarios, activeScenarioId: "deleted" });

    const filter = await page.findCombobox("Scenario filter");
    expect(filter).toHaveTextContent("Baseline only");

    expect(await page.findText("$1,000.00")).toBeInTheDocument();
  });
});

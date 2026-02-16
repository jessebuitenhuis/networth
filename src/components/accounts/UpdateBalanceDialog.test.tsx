import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mockApiResponses } from "@/test/mocks/mockApiResponses";
import { suppressRadixDialogWarnings } from "@/test/mocks/suppressRadixDialogWarnings";
import type { Transaction } from "@/transactions/Transaction.type";

import { UpdateBalanceDialogPage } from "./UpdateBalanceDialog.page";

suppressRadixDialogWarnings();

const createTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: "t1",
  accountId: "a1",
  amount: 500,
  date: "2024-01-10",
  description: "Opening balance",
  ...overrides,
});

const withBalance500 = [createTransaction()];

describe("UpdateBalanceDialog", () => {
  beforeEach(() => {
    mockApiResponses();
    vi.setSystemTime(new Date("2024-01-15"));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders trigger button with 'Update Balance' text", () => {
    const page = UpdateBalanceDialogPage.render();
    expect(page.triggerButton).toBeInTheDocument();
    expect(page.triggerButton).toHaveTextContent("Update Balance");
  });

  it("opens dialog when trigger clicked", async () => {
    const page = UpdateBalanceDialogPage.render();
    expect(page.queryDialog()).not.toBeInTheDocument();
    await page.open();
    expect(page.dialog).toBeInTheDocument();
  });

  it("shows current baseline balance", async () => {
    const page = await UpdateBalanceDialogPage.renderAndOpen({ transactions: withBalance500 });
    expect(page.currentBalanceDisplay).toHaveTextContent("$500.00");
  });

  it("shows $0.00 when no transactions exist", async () => {
    const page = await UpdateBalanceDialogPage.renderAndOpen({ transactions: [] });
    expect(page.currentBalanceDisplay).toHaveTextContent("$0.00");
  });

  it("has New Value, Description, and Date fields", async () => {
    const page = await UpdateBalanceDialogPage.renderAndOpen();
    expect(page.newValueInput).toBeInTheDocument();
    expect(page.descriptionInput).toBeInTheDocument();
    expect(page.dateInput).toBeInTheDocument();
  });

  it("description defaults to 'Balance adjustment'", async () => {
    const page = await UpdateBalanceDialogPage.renderAndOpen();
    expect(page.descriptionInput).toHaveValue("Balance adjustment");
  });

  it("date defaults to today", async () => {
    const page = await UpdateBalanceDialogPage.renderAndOpen();
    expect(page.dateInput).toHaveValue("2024-01-15");
  });

  it("shows calculated positive adjustment", async () => {
    const page = await UpdateBalanceDialogPage.renderAndOpen({ transactions: withBalance500 });
    await page.clearAndFillNewValue("750");
    expect(page.adjustmentDisplay).toHaveTextContent("+US$250.00");
  });

  it("shows calculated negative adjustment", async () => {
    const page = await UpdateBalanceDialogPage.renderAndOpen({ transactions: withBalance500 });
    await page.clearAndFillNewValue("300");
    expect(page.adjustmentDisplay).toHaveTextContent("-US$200.00");
  });

  it("disables submit when adjustment is zero", async () => {
    const page = await UpdateBalanceDialogPage.renderAndOpen({ transactions: withBalance500 });
    await page.clearAndFillNewValue("500");
    expect(page.submitButton).toBeDisabled();
  });

  it("enables submit when adjustment is non-zero", async () => {
    const page = await UpdateBalanceDialogPage.renderAndOpen({ transactions: withBalance500 });
    await page.clearAndFillNewValue("750");
    expect(page.submitButton).not.toBeDisabled();
  });

  it("creates adjustment transaction on submit", async () => {
    const page = await UpdateBalanceDialogPage.renderAndOpen({ transactions: withBalance500 });
    await page.clearAndFillNewValue("750");
    await page.submit();
    expect(page.transactionsList).toHaveTextContent("Balance adjustment - 250");
  });

  it("creates negative adjustment transaction", async () => {
    const page = await UpdateBalanceDialogPage.renderAndOpen({ transactions: withBalance500 });
    await page.clearAndFillNewValue("300");
    await page.submit();
    expect(page.transactionsList).toHaveTextContent("Balance adjustment - -200");
  });

  it("created transaction has no scenarioId (baseline)", async () => {
    const page = await UpdateBalanceDialogPage.renderAndOpen({ transactions: withBalance500 });
    await page.clearAndFillNewValue("750");
    await page.submit();

    const postCalls = vi.mocked(globalThis.fetch).mock.calls.filter(
      ([url, init]) => url === "/api/transactions" && init?.method === "POST",
    );
    expect(postCalls).toHaveLength(1);
    const body = JSON.parse(postCalls[0][1]!.body as string);
    expect(body.description).toBe("Balance adjustment");
    expect(body.scenarioId).toBeUndefined();
  });

  it("uses custom description when edited", async () => {
    const page = await UpdateBalanceDialogPage.renderAndOpen({ transactions: withBalance500 });
    await page.clearAndFillNewValue("750");
    await page.clearAndFillDescription("Bank reconciliation");
    await page.submit();
    expect(page.transactionsList).toHaveTextContent("Bank reconciliation - 250");
  });

  it("uses custom date when edited", async () => {
    const page = await UpdateBalanceDialogPage.renderAndOpen({ transactions: withBalance500 });
    await page.clearAndFillNewValue("750");
    await page.clearAndFillDate("2024-01-20");
    await page.submit();

    const postCalls = vi.mocked(globalThis.fetch).mock.calls.filter(
      ([url, init]) => url === "/api/transactions" && init?.method === "POST",
    );
    expect(postCalls).toHaveLength(1);
    const body = JSON.parse(postCalls[0][1]!.body as string);
    expect(body.date).toBe("2024-01-20");
  });

  it("trims whitespace from description", async () => {
    const page = await UpdateBalanceDialogPage.renderAndOpen({ transactions: withBalance500 });
    await page.clearAndFillNewValue("750");
    await page.clearAndFillDescription("  Reconcile  ");
    await page.submit();

    const postCalls = vi.mocked(globalThis.fetch).mock.calls.filter(
      ([url, init]) => url === "/api/transactions" && init?.method === "POST",
    );
    expect(postCalls).toHaveLength(1);
    const body = JSON.parse(postCalls[0][1]!.body as string);
    expect(body.description).toBe("Reconcile");
  });

  it("closes dialog after submit", async () => {
    const page = await UpdateBalanceDialogPage.renderAndOpen({ transactions: withBalance500 });
    expect(page.dialog).toBeInTheDocument();
    await page.clearAndFillNewValue("750");
    await page.submit();
    expect(page.queryDialog()).not.toBeInTheDocument();
  });

  it("resets form when reopened", async () => {
    const page = await UpdateBalanceDialogPage.renderAndOpen({ transactions: withBalance500 });
    await page.clearAndFillNewValue("750");
    await page.clearAndFillDescription("Custom");
    await page.submit();

    await page.open();
    expect(page.newValueInput).toHaveValue("0");
    expect(page.descriptionInput).toHaveValue("Balance adjustment");
    expect(page.currentBalanceDisplay).toHaveTextContent("$750.00");
  });

  it("recalculates current balance when date changes to past", async () => {
    const transactions = [
      createTransaction({ amount: 300, date: "2024-01-05" }),
      createTransaction({ id: "t2", amount: 200, date: "2024-01-10", description: "Deposit" }),
    ];
    const page = await UpdateBalanceDialogPage.renderAndOpen({ transactions });

    expect(page.currentBalanceDisplay).toHaveTextContent("$500.00");

    await page.clearAndFillDate("2024-01-08");

    expect(page.currentBalanceDisplay).toHaveTextContent("$300.00");
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

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
    vi.setSystemTime(new Date("2024-01-15"));
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

  it("calls onSave with adjustment transaction on submit", async () => {
    const page = await UpdateBalanceDialogPage.renderAndOpen({ transactions: withBalance500 });
    await page.clearAndFillNewValue("750");
    await page.submit();

    expect(page.onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: "a1",
        amount: 250,
        description: "Balance adjustment",
      }),
    );
  });

  it("calls onSave with negative adjustment transaction", async () => {
    const page = await UpdateBalanceDialogPage.renderAndOpen({ transactions: withBalance500 });
    await page.clearAndFillNewValue("300");
    await page.submit();

    expect(page.onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: "a1",
        amount: -200,
      }),
    );
  });

  it("created transaction has no scenarioId (baseline)", async () => {
    const page = await UpdateBalanceDialogPage.renderAndOpen({ transactions: withBalance500 });
    await page.clearAndFillNewValue("750");
    await page.submit();

    expect(page.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ description: "Balance adjustment" }),
    );
    const savedTransaction = page.onSave.mock.calls[0][0];
    expect(savedTransaction.scenarioId).toBeUndefined();
  });

  it("uses custom description when edited", async () => {
    const page = await UpdateBalanceDialogPage.renderAndOpen({ transactions: withBalance500 });
    await page.clearAndFillNewValue("750");
    await page.clearAndFillDescription("Bank reconciliation");
    await page.submit();

    expect(page.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ description: "Bank reconciliation" }),
    );
  });

  it("uses custom date when edited", async () => {
    const page = await UpdateBalanceDialogPage.renderAndOpen({ transactions: withBalance500 });
    await page.clearAndFillNewValue("750");
    await page.clearAndFillDate("2024-01-20");
    await page.submit();

    expect(page.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ date: "2024-01-20" }),
    );
  });

  it("trims whitespace from description", async () => {
    const page = await UpdateBalanceDialogPage.renderAndOpen({ transactions: withBalance500 });
    await page.clearAndFillNewValue("750");
    await page.clearAndFillDescription("  Reconcile  ");
    await page.submit();

    expect(page.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ description: "Reconcile" }),
    );
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

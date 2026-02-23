import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Account } from "@/accounts/Account.type";
import { AccountType } from "@/accounts/AccountType";
import { mockApiResponses } from "@/test/mocks/mockApiResponses";

import { EditAccountDialogPage } from "./EditAccountDialog.page";

const account: Account = {
  id: "1",
  name: "Checking",
  type: AccountType.Asset,
};

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("EditAccountDialog", () => {
  beforeEach(() => {
    mockApiResponses();
    mockPush.mockClear();
  });

  it("renders pencil trigger with correct aria-label", () => {
    const page = EditAccountDialogPage.render();
    expect(page.triggerButton).toBeInTheDocument();
  });

  it("opens dialog showing current name and type", async () => {
    const page = EditAccountDialogPage.render();
    await page.open();
    expect(page.dialog).toBeInTheDocument();
    expect(page.nameInput).toHaveValue("Checking");
    expect(page.typeSelect).toHaveTextContent("Asset");
  });

  it("editing name and saving calls updateAccount", async () => {
    mockApiResponses({ accounts: [account] });
    const page = EditAccountDialogPage.render();
    await screen.findByText("Checking - Asset");
    await page.open();
    await page.clearAndFillName("Savings");
    await page.save();
    expect(page.accountsList).toHaveTextContent("Savings - Asset");
    expect(page.queryDialog()).not.toBeInTheDocument();
  });

  it("editing type and saving calls updateAccount", async () => {
    mockApiResponses({ accounts: [account] });
    const page = EditAccountDialogPage.render();
    await screen.findByText("Checking - Asset");
    await page.open();
    await page.selectType("Liability");
    await page.save();
    expect(page.accountsList).toHaveTextContent("Checking - Liability");
  });

  it("empty name prevents submit", async () => {
    mockApiResponses({ accounts: [account] });
    const page = EditAccountDialogPage.render();
    await screen.findByText("Checking - Asset");
    await page.open();
    await page.clearAndFillName("");
    await page.save();
    expect(page.dialog).toBeInTheDocument();
    expect(page.accountsList).toHaveTextContent("Checking - Asset");
  });

  it("delete button shows confirmation dialog", async () => {
    const page = EditAccountDialogPage.render();
    await page.open();
    await page.clickDelete();
    expect(page.queryDialog()).not.toBeInTheDocument();
    expect(page.getDeleteConfirmText()).toBeInTheDocument();
  });

  it("confirming delete calls removeTransactionsByAccountId and removeAccount", async () => {
    mockApiResponses({
      accounts: [account],
      transactions: [
        {
          id: "t1",
          accountId: "1",
          amount: 100,
          date: "2024-01-01",
          description: "Test",
        },
      ],
    });
    const page = EditAccountDialogPage.render();
    await screen.findByText("Checking - Asset");
    await page.open();
    await page.clickDelete();
    await page.confirmDelete();
    expect(page.accountsList).toBeEmptyDOMElement();
    expect(page.txCount).toHaveTextContent("0");
    expect(mockPush).toHaveBeenCalledWith("/accounts");
  });

  it("resets form when dialog is reopened", async () => {
    mockApiResponses({ accounts: [account] });
    const page = EditAccountDialogPage.render();
    await screen.findByText("Checking - Asset");
    await page.open();
    await page.clearAndFillName("Changed");
    await page.pressEscape();
    await page.open();
    expect(page.nameInput).toHaveValue("Checking");
  });

  it("canceling delete returns to edit dialog", async () => {
    const page = EditAccountDialogPage.render();
    await page.open();
    await page.clickDelete();
    await page.cancelDelete();
    expect(page.queryDeleteConfirmText()).not.toBeInTheDocument();
    expect(page.dialog).toBeInTheDocument();
  });

  it("delete confirmation button uses destructive variant", async () => {
    const page = EditAccountDialogPage.render();
    await page.open();
    await page.clickDelete();
    expect(page.confirmDeleteButton).toHaveClass("bg-destructive");
  });

  it("shows Expected Annual Rate (%) with current value for accounts with return rate", async () => {
    const accountWithRate: Account = {
      id: "1",
      name: "Investment",
      type: AccountType.Asset,
      expectedReturnRate: 8,
    };
    mockApiResponses({ accounts: [accountWithRate] });
    const page = EditAccountDialogPage.render(accountWithRate);
    await screen.findByText("Investment - Asset - 8%");
    await page.open();
    expect(page.expectedReturnInput).toHaveValue(8);
  });

  it("saves updated expectedReturnRate", async () => {
    mockApiResponses({ accounts: [account] });
    const page = EditAccountDialogPage.render();
    await screen.findByText("Checking - Asset");
    await page.open();
    await page.fillExpectedReturn("12");
    await page.save();
    expect(page.accountsList).toHaveTextContent("Checking - Asset - 12%");
  });

  it("clears expectedReturnRate when field is emptied", async () => {
    const accountWithRate: Account = {
      id: "1",
      name: "Investment",
      type: AccountType.Asset,
      expectedReturnRate: 8,
    };
    mockApiResponses({ accounts: [accountWithRate] });
    const page = EditAccountDialogPage.render(accountWithRate);
    await screen.findByText("Investment - Asset - 8%");
    await page.open();
    expect(page.accountsList).toHaveTextContent("Investment - Asset - 8%");
    await page.clearExpectedReturn();
    await page.save();
    expect(page.accountsList).toHaveTextContent("Investment - Asset");
    expect(page.accountsList).not.toHaveTextContent("%");
  });
});

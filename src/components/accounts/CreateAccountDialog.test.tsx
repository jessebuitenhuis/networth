import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CreateAccountDialogPage } from "./CreateAccountDialog.page";

describe("CreateAccountDialog", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("crypto", {
      randomUUID: vi
        .fn()
        .mockReturnValueOnce("account-uuid")
        .mockReturnValueOnce("tx-uuid"),
    });
  });

  it("renders a trigger button", () => {
    const page = CreateAccountDialogPage.render();
    expect(page.triggerButton).toBeInTheDocument();
  });

  it("opens dialog when trigger is clicked", async () => {
    const page = CreateAccountDialogPage.render();
    await page.open();
    expect(page.dialog).toBeInTheDocument();
  });

  it("dialog contains Name, Type, and Balance fields", async () => {
    const page = CreateAccountDialogPage.render();
    await page.open();
    expect(page.nameInput).toBeInTheDocument();
    expect(page.typeSelect).toBeInTheDocument();
    expect(page.balanceInput).toBeInTheDocument();
  });

  it("shows Balance label with optional indicator", async () => {
    const page = CreateAccountDialogPage.render();
    await page.open();
    expect(screen.getByText("Balance")).toBeInTheDocument();
    expect(screen.getByText("(optional)")).toBeInTheDocument();
  });

  it("submits and creates account with correct data", async () => {
    const page = CreateAccountDialogPage.render();
    await page.open();
    await page.fillName("Checking");
    await page.clearAndFillBalance("1500");
    await page.submit();
    expect(page.accountsList).toHaveTextContent("Checking - Asset");
  });

  it("creates opening balance transaction when balance is non-zero", async () => {
    const page = CreateAccountDialogPage.render();
    await page.open();
    await page.fillName("Checking");
    await page.clearAndFillBalance("1500");
    await page.submit();
    expect(page.transactionsList).toHaveTextContent("Opening balance - 1500");
  });

  it("does not create transaction when balance is zero", async () => {
    const page = CreateAccountDialogPage.render();
    await page.open();
    await page.fillName("Empty");
    await page.submit();
    expect(page.transactionsList).toBeEmptyDOMElement();
  });

  it("closes dialog after successful submit", async () => {
    const page = CreateAccountDialogPage.render();
    await page.open();
    await page.fillName("Checking");
    await page.submit();
    expect(page.queryDialog()).not.toBeInTheDocument();
  });

  it("resets form after submit", async () => {
    const page = CreateAccountDialogPage.render();
    await page.open();
    await page.fillName("Checking");
    await page.clearAndFillBalance("500");
    await page.submit();
    await page.open();
    expect(page.nameInput).toHaveValue("");
    expect(page.balanceInput).toHaveValue("0");
  });

  it("does not submit with empty name", async () => {
    const page = CreateAccountDialogPage.render();
    await page.open();
    await page.submit();
    expect(page.accountsList).toBeEmptyDOMElement();
    expect(page.dialog).toBeInTheDocument();
  });

  it("creates liability account", async () => {
    const page = CreateAccountDialogPage.render();
    await page.open();
    await page.selectType("Liability");
    await page.fillName("Credit Card");
    await page.clearAndFillBalance("800");
    await page.submit();
    expect(page.accountsList).toHaveTextContent("Credit Card - Liability");
  });

  it("renders custom trigger when provided", () => {
    const customTrigger = <button>Custom Trigger</button>;
    CreateAccountDialogPage.renderWithTrigger(customTrigger);
    expect(screen.getByRole("button", { name: "Custom Trigger" })).toBeInTheDocument();
  });

  it("opens dialog when custom trigger is clicked", async () => {
    const customTrigger = <button>Custom Trigger</button>;
    const page = CreateAccountDialogPage.renderWithTrigger(customTrigger);
    await page.clickCustomTrigger("Custom Trigger");
    expect(page.dialog).toBeInTheDocument();
  });
});

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Account } from "@/accounts/Account.type";
import { AccountType } from "@/accounts/AccountType";

import { AccountPickerPage } from "./AccountPicker.page";

const mockAccounts: Account[] = [
  { id: "1", name: "Checking", type: AccountType.Asset },
  { id: "2", name: "Savings", type: AccountType.Asset },
  { id: "3", name: "Credit Card", type: AccountType.Liability },
];

describe("AccountPicker", () => {
  it("renders button with 'Accounts (N)' showing included count", () => {
    const excludedIds = new Set(["2"]);
    const page = AccountPickerPage.render({
      accounts: mockAccounts,
      excludedIds,
      onToggle: vi.fn(),
    });

    expect(page.triggerButton(2)).toBeInTheDocument();
  });

  it("shows total count when none excluded", () => {
    const page = AccountPickerPage.render({
      accounts: mockAccounts,
      excludedIds: new Set<string>(),
      onToggle: vi.fn(),
    });

    expect(page.triggerButton(3)).toBeInTheDocument();
  });

  it("shows 0 when all accounts excluded", () => {
    const page = AccountPickerPage.render({
      accounts: mockAccounts,
      excludedIds: new Set(["1", "2", "3"]),
      onToggle: vi.fn(),
    });

    expect(page.triggerButton(0)).toBeInTheDocument();
  });

  it("opening popover shows account checkboxes", async () => {
    const page = AccountPickerPage.render({
      accounts: mockAccounts,
      excludedIds: new Set<string>(),
      onToggle: vi.fn(),
    });

    await page.open(3);

    expect(screen.getByRole("checkbox", { name: "Checking" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Savings" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Credit Card" })).toBeInTheDocument();
  });

  it("checkboxes reflect excludedIds prop (checked = included)", async () => {
    const excludedIds = new Set(["2"]);
    const page = AccountPickerPage.render({
      accounts: mockAccounts,
      excludedIds,
      onToggle: vi.fn(),
    });

    await page.open(2);

    expect(page.checkbox("Checking")).toBeChecked();
    expect(page.checkbox("Savings")).not.toBeChecked();
    expect(page.checkbox("Credit Card")).toBeChecked();
  });

  it("renders nothing when fewer than 2 accounts exist", () => {
    const { container } = AccountPickerPage.renderAndGetContainer({
      accounts: [{ id: "1", name: "Checking", type: AccountType.Asset }],
      excludedIds: new Set<string>(),
      onToggle: vi.fn(),
    });

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when no accounts exist", () => {
    const { container } = AccountPickerPage.renderAndGetContainer({
      accounts: [],
      excludedIds: new Set<string>(),
      onToggle: vi.fn(),
    });

    expect(container).toBeEmptyDOMElement();
  });

  it("renders when exactly 2 accounts exist", () => {
    const page = AccountPickerPage.render({
      accounts: [
        { id: "1", name: "Checking", type: AccountType.Asset },
        { id: "2", name: "Savings", type: AccountType.Asset },
      ],
      excludedIds: new Set<string>(),
      onToggle: vi.fn(),
    });

    expect(page.triggerButton(2)).toBeInTheDocument();
  });

  it("clicking checkbox calls onToggle with correct id", async () => {
    const onToggle = vi.fn();
    const page = AccountPickerPage.render({
      accounts: mockAccounts,
      excludedIds: new Set<string>(),
      onToggle,
    });

    await page.open(3);
    await page.toggleCheckbox("Savings");

    expect(onToggle).toHaveBeenCalledWith("2");
  });
});

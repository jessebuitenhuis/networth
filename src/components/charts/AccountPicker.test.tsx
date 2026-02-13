import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { Account } from "@/models/Account.type";
import { AccountType } from "@/models/AccountType";

import { AccountPicker } from "./AccountPicker";

const mockAccounts: Account[] = [
  { id: "1", name: "Checking", type: AccountType.Asset },
  { id: "2", name: "Savings", type: AccountType.Asset },
  { id: "3", name: "Credit Card", type: AccountType.Liability },
];

describe("AccountPicker", () => {
  it("renders button with 'Accounts (N)' showing included count", () => {
    const excludedIds = new Set(["2"]);
    render(
      <AccountPicker
        accounts={mockAccounts}
        excludedIds={excludedIds}
        onToggle={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: "Accounts (2)" })
    ).toBeInTheDocument();
  });

  it("shows total count when none excluded", () => {
    const excludedIds = new Set<string>();
    render(
      <AccountPicker
        accounts={mockAccounts}
        excludedIds={excludedIds}
        onToggle={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: "Accounts (3)" })
    ).toBeInTheDocument();
  });

  it("shows 0 when all accounts excluded", () => {
    const excludedIds = new Set(["1", "2", "3"]);
    render(
      <AccountPicker
        accounts={mockAccounts}
        excludedIds={excludedIds}
        onToggle={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: "Accounts (0)" })
    ).toBeInTheDocument();
  });

  it("opening popover shows account checkboxes", async () => {
    const excludedIds = new Set<string>();
    render(
      <AccountPicker
        accounts={mockAccounts}
        excludedIds={excludedIds}
        onToggle={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Accounts (3)" }));

    expect(screen.getByRole("checkbox", { name: "Checking" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Savings" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Credit Card" })).toBeInTheDocument();
  });

  it("checkboxes reflect excludedIds prop (checked = included)", async () => {
    const excludedIds = new Set(["2"]);
    render(
      <AccountPicker
        accounts={mockAccounts}
        excludedIds={excludedIds}
        onToggle={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Accounts (2)" }));

    expect(screen.getByRole("checkbox", { name: "Checking" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Savings" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Credit Card" })).toBeChecked();
  });

  it("clicking checkbox calls onToggle with correct id", async () => {
    const onToggle = vi.fn();
    const excludedIds = new Set<string>();
    render(
      <AccountPicker
        accounts={mockAccounts}
        excludedIds={excludedIds}
        onToggle={onToggle}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Accounts (3)" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Savings" }));

    expect(onToggle).toHaveBeenCalledWith("2");
  });

});

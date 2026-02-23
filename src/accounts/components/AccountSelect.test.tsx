import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { mockResizeObserver } from "@/test/mocks/mockResizeObserver";

mockResizeObserver();

import type { Account } from "@/accounts/Account.type";

import { AccountSelect } from "./AccountSelect";

const accounts: Account[] = [
  { id: "a1", name: "Checking", type: "Asset" },
  { id: "a2", name: "Savings", type: "Asset" },
  { id: "a3", name: "Mortgage", type: "Liability" },
];

function renderSelect(overrides: Partial<Parameters<typeof AccountSelect>[0]> = {}) {
  const props = {
    accounts,
    value: "none",
    onValueChange: vi.fn(),
    ...overrides,
  };
  render(<AccountSelect {...props} />);
  return props;
}

describe("AccountSelect", () => {
  it("renders with label", () => {
    renderSelect();
    expect(screen.getByLabelText("Account")).toBeInTheDocument();
  });

  it("shows placeholder when no account selected", async () => {
    const user = userEvent.setup();
    renderSelect();
    // The combobox trigger should show placeholder text
    const trigger = screen.getByRole("combobox", { name: "Account" });
    expect(trigger).toHaveTextContent("Select account");
    // Verify we can open and select
    await user.click(trigger);
    expect(screen.getByRole("option", { name: "Checking" })).toBeInTheDocument();
  });

  it("lists all accounts", async () => {
    const user = userEvent.setup();
    renderSelect();

    await user.click(screen.getByRole("combobox", { name: "Account" }));

    expect(screen.getByRole("option", { name: "Checking" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Savings" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Mortgage" })).toBeInTheDocument();
  });

  it("calls onValueChange when account is selected", async () => {
    const user = userEvent.setup();
    const { onValueChange } = renderSelect();

    await user.click(screen.getByRole("combobox", { name: "Account" }));
    await user.click(screen.getByRole("option", { name: "Savings" }));

    expect(onValueChange).toHaveBeenCalledWith("a2");
  });

  it("shows selected account name", () => {
    renderSelect({ value: "a1" });
    expect(screen.getByText("Checking")).toBeInTheDocument();
  });

  it("does not have a 'None' option", async () => {
    const user = userEvent.setup();
    renderSelect();

    await user.click(screen.getByRole("combobox", { name: "Account" }));

    expect(screen.queryByRole("option", { name: /none/i })).not.toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ChartLegend } from "./ChartLegend";
import { AccountType } from "@/models/AccountType";
import type { Account } from "@/models/Account";

const accounts: Account[] = [
  { id: "1", name: "Checking", type: AccountType.Asset },
  { id: "2", name: "Savings", type: AccountType.Asset },
  { id: "3", name: "Credit Card", type: AccountType.Liability },
];

describe("ChartLegend", () => {
  it("renders a button for each account", () => {
    render(
      <ChartLegend accounts={accounts} excludedIds={new Set()} onToggle={vi.fn()} />
    );

    expect(screen.getByRole("button", { name: "Checking" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Savings" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Credit Card" })).toBeInTheDocument();
  });

  it("marks included accounts as pressed", () => {
    render(
      <ChartLegend accounts={accounts} excludedIds={new Set(["2"])} onToggle={vi.fn()} />
    );

    expect(screen.getByRole("button", { name: "Checking" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Savings" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Credit Card" })).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onToggle with the account id when clicked", async () => {
    const onToggle = vi.fn();
    render(
      <ChartLegend accounts={accounts} excludedIds={new Set()} onToggle={onToggle} />
    );

    await userEvent.click(screen.getByRole("button", { name: "Savings" }));

    expect(onToggle).toHaveBeenCalledWith("2");
  });

  it("renders nothing when accounts array is empty", () => {
    const { container } = render(
      <ChartLegend accounts={[]} excludedIds={new Set()} onToggle={vi.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });
});

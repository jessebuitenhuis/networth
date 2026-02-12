import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ChartLegend } from "./ChartLegend";
import { AccountType } from "@/models/AccountType";
import type { Account } from "@/models/Account.type";

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

  it("renders a colored dot for each account using getAccountColor", () => {
    const { container } = render(
      <ChartLegend accounts={accounts} excludedIds={new Set()} onToggle={vi.fn()} />
    );

    const dots = container.querySelectorAll("[data-testid='legend-dot']");
    expect(dots).toHaveLength(3);
    expect((dots[0] as HTMLElement).style.backgroundColor).toBe("rgb(59, 130, 246)");
    expect((dots[1] as HTMLElement).style.backgroundColor).toBe("rgb(239, 68, 68)");
    expect((dots[2] as HTMLElement).style.backgroundColor).toBe("rgb(34, 197, 94)");
  });

  it("applies opacity-40 to excluded accounts", () => {
    render(
      <ChartLegend accounts={accounts} excludedIds={new Set(["2"])} onToggle={vi.fn()} />
    );

    const savingsButton = screen.getByRole("button", { name: "Savings" });
    expect(savingsButton.className).toContain("opacity-40");
    const checkingButton = screen.getByRole("button", { name: "Checking" });
    expect(checkingButton.className).not.toContain("opacity-40");
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

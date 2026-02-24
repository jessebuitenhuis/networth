import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AccountType } from "@/accounts/AccountType";

import type { WizardAccountEntry } from "../WizardAccountEntry.type";
import { GrowthStep } from "./GrowthStep";

describe("GrowthStep", () => {
  it("renders asset accounts with return rate inputs", () => {
    const accounts: WizardAccountEntry[] = [
      { tempId: "a1", name: "401(k)", type: AccountType.Asset, balance: 50000, expectedReturnRate: 7 },
    ];
    render(<GrowthStep accounts={accounts} onUpdate={vi.fn()} />);
    expect(screen.getByLabelText("401(k) return rate")).toBeInTheDocument();
  });

  it("does not render liability accounts", () => {
    const accounts: WizardAccountEntry[] = [
      { tempId: "a1", name: "Credit Card", type: AccountType.Liability, balance: 0 },
    ];
    render(<GrowthStep accounts={accounts} onUpdate={vi.fn()} />);
    expect(screen.getByText(/add asset accounts/i)).toBeInTheDocument();
  });

  it("shows message when no asset accounts exist", () => {
    render(<GrowthStep accounts={[]} onUpdate={vi.fn()} />);
    expect(screen.getByText(/add asset accounts/i)).toBeInTheDocument();
  });

  it("displays existing return rate value", () => {
    const accounts: WizardAccountEntry[] = [
      { tempId: "a1", name: "Brokerage", type: AccountType.Asset, balance: 0, expectedReturnRate: 10 },
    ];
    render(<GrowthStep accounts={accounts} onUpdate={vi.fn()} />);
    expect(screen.getByLabelText("Brokerage return rate")).toHaveValue(10);
  });
});

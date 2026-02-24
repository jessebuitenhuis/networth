import { describe, expect, it } from "vitest";

import { AccountType } from "@/accounts/AccountType";

import type { WizardAccountEntry } from "../WizardAccountEntry.type";
import { AccountsStepPage } from "./AccountsStep.page";

describe("AccountsStep", () => {
  it("renders suggestion chips", () => {
    const page = AccountsStepPage.render();
    expect(page.getSuggestionButton("Checking")).toBeInTheDocument();
    expect(page.getSuggestionButton("Savings")).toBeInTheDocument();
    expect(page.getSuggestionButton("401\\(k\\)")).toBeInTheDocument();
  });

  it("calls onAdd when suggestion is clicked", async () => {
    const page = AccountsStepPage.render();
    await page.clickSuggestion("Checking");

    expect(page.onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Checking",
        type: AccountType.Asset,
        balance: 0,
      }),
    );
  });

  it("hides suggestion after it is added", () => {
    const accounts: WizardAccountEntry[] = [
      { tempId: "a1", name: "Checking", type: AccountType.Asset, balance: 0 },
    ];
    const page = AccountsStepPage.render(accounts);
    expect(page.querySuggestionButton("Checking")).not.toBeInTheDocument();
  });

  it("renders added accounts with balance input", () => {
    const accounts: WizardAccountEntry[] = [
      { tempId: "a1", name: "Checking", type: AccountType.Asset, balance: 1000 },
    ];
    const page = AccountsStepPage.render(accounts);
    expect(page.getBalanceInput("Checking")).toBeInTheDocument();
  });

  it("calls onRemove when remove button is clicked", async () => {
    const accounts: WizardAccountEntry[] = [
      { tempId: "a1", name: "Checking", type: AccountType.Asset, balance: 0 },
    ];
    const page = AccountsStepPage.render(accounts);
    await page.clickRemove("Checking");
    expect(page.onRemove).toHaveBeenCalledWith("a1");
  });
});

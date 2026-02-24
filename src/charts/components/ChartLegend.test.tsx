import { describe, expect, it, vi } from "vitest";

import type { Account } from "@/accounts/Account.type";
import { AccountType } from "@/accounts/AccountType";

import { ChartLegendPage } from "./ChartLegend.page";

const accounts: Account[] = [
  { id: "1", name: "Checking", type: AccountType.Asset },
  { id: "2", name: "Savings", type: AccountType.Asset },
  { id: "3", name: "Credit Card", type: AccountType.Liability },
];

describe("ChartLegend", () => {
  it("renders a button for each account", () => {
    const page = ChartLegendPage.render({ accounts, excludedIds: new Set() });

    expect(page.getButton("Checking")).toBeInTheDocument();
    expect(page.getButton("Savings")).toBeInTheDocument();
    expect(page.getButton("Credit Card")).toBeInTheDocument();
  });

  it("renders a colored dot for each account using getAccountColor", () => {
    const page = ChartLegendPage.render({ accounts, excludedIds: new Set() });

    const dots = page.legendDots;
    expect(dots).toHaveLength(3);
    expect((dots[0] as HTMLElement).style.getPropertyValue("--dot-color")).toBe("#3b82f6");
    expect((dots[1] as HTMLElement).style.getPropertyValue("--dot-color")).toBe("#ef4444");
    expect((dots[2] as HTMLElement).style.getPropertyValue("--dot-color")).toBe("#22c55e");
  });

  it("applies opacity-30 to excluded accounts", () => {
    const page = ChartLegendPage.render({ accounts, excludedIds: new Set(["2"]) });

    expect(page.getButton("Savings").className).toContain("opacity-30");
    expect(page.getButton("Checking").className).not.toContain("opacity-30");
  });

  it("marks included accounts as pressed", () => {
    const page = ChartLegendPage.render({ accounts, excludedIds: new Set(["2"]) });

    expect(page.getButton("Checking")).toHaveAttribute("aria-pressed", "true");
    expect(page.getButton("Savings")).toHaveAttribute("aria-pressed", "false");
    expect(page.getButton("Credit Card")).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onToggle with the account id when clicked", async () => {
    const onToggle = vi.fn();
    const page = ChartLegendPage.render({ accounts, excludedIds: new Set(), onToggle });

    await page.clickButton("Savings");

    expect(onToggle).toHaveBeenCalledWith("2");
  });

  it("renders nothing when accounts array is empty", () => {
    const page = ChartLegendPage.render({ accounts: [], excludedIds: new Set() });

    expect(page.container).toBeEmptyDOMElement();
  });
});

import { beforeEach, describe, expect, it } from "vitest";

import { AccountType } from "@/accounts/AccountType";
import { mockApiResponses } from "@/test/mocks/mockApiResponses";

import { GoalProgressSectionPage } from "./GoalProgressSection.page";

describe("GoalProgressSection", () => {
  beforeEach(() => mockApiResponses());

  it("renders nothing when there are no goals", () => {
    const page = GoalProgressSectionPage.render();
    expect(page.container).toBeEmptyDOMElement();
  });

  it("renders section heading when goals exist", async () => {
    const goals = [{ id: "1", name: "Goal 1", targetAmount: 10000 }];
    const page = GoalProgressSectionPage.render({ goals });
    expect(await page.findByText("Goal Progress")).toBeInTheDocument();
  });

  it("renders goal progress cards", async () => {
    const goals = [
      { id: "g1", name: "Emergency Fund", targetAmount: 10000 },
      { id: "g2", name: "Vacation", targetAmount: 5000 },
    ];
    const page = GoalProgressSectionPage.render({ goals });

    expect(await page.findByText("Emergency Fund")).toBeInTheDocument();
    expect(page.getByText("Vacation")).toBeInTheDocument();
  });

  it("calculates correct percentage from account data", async () => {
    const accounts = [
      { id: "1", name: "Savings", type: AccountType.Asset },
      { id: "2", name: "Checking", type: AccountType.Asset },
    ];
    const transactions = [
      { id: "t1", accountId: "1", amount: 5000, date: "2024-01-01", description: "Initial" },
      { id: "t2", accountId: "2", amount: 3000, date: "2024-01-01", description: "Initial" },
    ];
    const goals = [{ id: "g1", name: "Goal", targetAmount: 8000 }];

    const page = GoalProgressSectionPage.render({ accounts, transactions, goals });

    expect(await page.findByText("100% complete")).toBeInTheDocument();
    expect(await page.findByText("Achieved!")).toBeInTheDocument();
  });

  it("displays not projected message when no projection available", async () => {
    const accounts = [
      { id: "1", name: "Savings", type: AccountType.Asset },
    ];
    const transactions = [
      { id: "t1", accountId: "1", amount: 2000, date: "2024-01-01", description: "Initial" },
    ];
    const goals = [{ id: "g1", name: "Big Goal", targetAmount: 1000000 }];

    const page = GoalProgressSectionPage.render({ accounts, transactions, goals });

    expect(await page.findByText("Not projected within 50 years")).toBeInTheDocument();
  });

  it("correctly calculates net worth with liabilities", async () => {
    const accounts = [
      { id: "1", name: "Savings", type: AccountType.Asset },
      { id: "2", name: "Loan", type: AccountType.Liability },
    ];
    const transactions = [
      { id: "t1", accountId: "1", amount: 10000, date: "2024-01-01", description: "Savings" },
      { id: "t2", accountId: "2", amount: 3000, date: "2024-01-01", description: "Loan" },
    ];
    const goals = [{ id: "g1", name: "Goal", targetAmount: 7000 }];

    const page = GoalProgressSectionPage.render({ accounts, transactions, goals });

    expect(await page.findByText("100% complete")).toBeInTheDocument();
  });
});

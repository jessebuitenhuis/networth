import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AccountType } from "@/accounts/AccountType";
import { RecurrenceFrequency } from "@/recurring-transactions/RecurrenceFrequency";
import { mockApiResponses } from "@/test/mocks/mockApiResponses";

import { PlanningPageObject } from "./page.page";

vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

describe("PlanningPage", () => {
  beforeEach(() => {
    mockApiResponses();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the Planning heading", () => {
    const page = PlanningPageObject.render();

    expect(page.getHeading("Planning")).toBeInTheDocument();
  });

  it("renders the projected net worth chart", () => {
    const page = PlanningPageObject.render();

    expect(page.getTestId("projected-chart")).toBeInTheDocument();
  });

  it("renders the scenario picker when scenarios exist", async () => {
    mockApiResponses({
      scenarios: [{ id: "scenario-1", name: "Optimistic" }],
    });

    const page = PlanningPageObject.render();

    expect(await page.findButton(/scenarios/i)).toBeInTheDocument();
  });

  it("hides the scenario picker when no scenarios exist", () => {
    const page = PlanningPageObject.render();

    expect(page.queryButton(/scenarios/i)).not.toBeInTheDocument();
  });

  it("renders the Account picker when 2+ accounts exist", async () => {
    mockApiResponses({
      accounts: [
        { id: "acc-1", name: "Checking", type: AccountType.Asset },
        { id: "acc-2", name: "Savings", type: AccountType.Asset },
      ],
    });

    const page = PlanningPageObject.render();

    expect(await page.findButton(/accounts/i)).toBeInTheDocument();
  });

  it("hides the Account picker when fewer than 2 accounts exist", () => {
    const page = PlanningPageObject.render();

    expect(page.queryButton(/accounts/i)).not.toBeInTheDocument();
  });

  it("renders the create scenario button", () => {
    const page = PlanningPageObject.render();

    expect(page.getButton(/new scenario/i)).toBeInTheDocument();
  });

  it("toggles scenario selection when checkbox is clicked", async () => {
    mockApiResponses({
      scenarios: [{ id: "scenario-1", name: "Optimistic" }],
    });

    const page = PlanningPageObject.render();

    await page.findButton("Scenarios (0)");

    await page.clickButton("Scenarios (0)");
    await page.clickCheckbox("Optimistic");

    expect(page.getButton("Scenarios (1)")).toBeInTheDocument();
  });

  it("toggles account filter when checkbox is clicked", async () => {
    mockApiResponses({
      accounts: [
        { id: "acc-1", name: "Checking", type: AccountType.Asset },
        { id: "acc-2", name: "Savings", type: AccountType.Asset },
      ],
    });

    const page = PlanningPageObject.render();

    await page.findButton("Accounts (2)");

    await page.clickButton("Accounts (2)");
    await page.clickCheckbox("Checking");

    expect(page.getButton("Accounts (1)")).toBeInTheDocument();
  });

  it("creates scenario and auto-selects it", async () => {
    mockApiResponses();

    const page = PlanningPageObject.render();

    await page.clickButton(/new scenario/i);
    await page.typeIntoLabel(/name/i, "My Scenario");
    await page.clickButton(/create$/i);

    expect(page.getButton("Scenarios (1)")).toBeInTheDocument();
  });

  it("hides scenario picker after deleting last scenario", async () => {
    mockApiResponses({
      scenarios: [{ id: "scenario-1", name: "Optimistic" }],
    });

    const page = PlanningPageObject.render();

    await page.findButton("Scenarios (0)");

    await page.clickButton("Scenarios (0)");
    await page.clickCheckbox("Optimistic");
    await page.clickButton("Edit Scenario");

    await page.clickButton(/delete/i);
    await page.clickLastButton(/delete/i);

    expect(page.queryButton(/scenarios/i)).not.toBeInTheDocument();
  });

  it("duplicates scenario with transactions and auto-selects the copy", async () => {
    mockApiResponses({
      accounts: [{ id: "acc-1", name: "Checking", type: AccountType.Asset }],
      scenarios: [{ id: "scenario-1", name: "Optimistic" }],
      transactions: [
        {
          id: "t-1",
          accountId: "acc-1",
          amount: 500,
          date: "2024-06-01",
          description: "Bonus",
          scenarioId: "scenario-1",
        },
      ],
      recurringTransactions: [
        {
          id: "rt-1",
          accountId: "acc-1",
          amount: 100,
          description: "Monthly",
          frequency: RecurrenceFrequency.Monthly,
          startDate: "2024-01-01",
          scenarioId: "scenario-1",
        },
      ],
    });

    const page = PlanningPageObject.render();

    await page.findButton("Scenarios (0)");

    await page.clickButton("Scenarios (0)");
    await page.clickButton("Duplicate Scenario");

    expect(page.getLabel(/name/i)).toHaveValue("Optimistic (Copy)");
    await page.clickButton(/duplicate$/i);

    expect(page.getButton("Scenarios (1)")).toBeInTheDocument();
  });

  it("clears all scenarios when Deselect all is clicked", async () => {
    mockApiResponses({
      scenarios: [
        { id: "scenario-1", name: "Optimistic" },
        { id: "scenario-2", name: "Conservative" },
      ],
    });

    const page = PlanningPageObject.render();

    await page.findButton("Scenarios (0)");

    await page.clickButton("Scenarios (0)");
    await page.clickCheckbox("Optimistic");
    await page.clickCheckbox("Conservative");

    expect(page.getButton("Scenarios (2)")).toBeInTheDocument();

    await page.clickButton("Deselect all");

    expect(page.getButton("Scenarios (0)")).toBeInTheDocument();
  });
});

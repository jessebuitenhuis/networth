import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RecurringTransactionProvider } from "@/recurring-transactions/RecurringTransactionContext";
import type { Scenario } from "@/scenarios/Scenario.type";
import { ScenarioProvider } from "@/scenarios/ScenarioContext";
import { mockApiResponses } from "@/test/mocks/mockApiResponses";
import { TransactionProvider } from "@/transactions/TransactionContext";

import { EditScenarioDialog } from "./EditScenarioDialog";
import { EditScenarioDialogPage } from "./EditScenarioDialog.page";

const scenario: Scenario = {
  id: "1",
  name: "Test Scenario",
};

describe("EditScenarioDialog", () => {
  beforeEach(() => {
    mockApiResponses();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders pencil trigger with correct size and aria-label", () => {
    const page = EditScenarioDialogPage.render();

    expect(page.triggerButton).toBeInTheDocument();
    expect(page.triggerButton.className).toContain("h-6");
    expect(page.triggerButton.className).toContain("w-6");
  });

  it("opens dialog with current name pre-populated", async () => {
    const page = EditScenarioDialogPage.render();
    await page.open();

    expect(page.dialog).toBeInTheDocument();
    expect(page.nameInput).toHaveValue("Test Scenario");
  });

  it("saves updated name", async () => {
    mockApiResponses({ scenarios: [scenario], activeScenarioId: "1" });
    const page = EditScenarioDialogPage.render();
    await page.open();

    await screen.findByText("Test Scenario");
    await page.fillName("Updated Name");
    await page.save();

    expect(screen.getByText("Updated Name")).toBeInTheDocument();
    expect(page.queryAnyDialog()).not.toBeInTheDocument();
  });

  it("trims whitespace from name", async () => {
    mockApiResponses({ scenarios: [scenario], activeScenarioId: "1" });
    const page = EditScenarioDialogPage.render();
    await page.open();

    await screen.findByText("Test Scenario");
    await page.fillName("  Trimmed  ");
    await page.save();

    expect(screen.getByText("Trimmed")).toBeInTheDocument();
  });

  it("empty name prevents submit", async () => {
    mockApiResponses({ scenarios: [scenario] });
    const page = EditScenarioDialogPage.render();
    await page.open();

    await page.fillName("");
    await page.save();

    expect(page.queryAnyDialog()).toBeInTheDocument();
    expect(screen.getByText("Test Scenario")).toBeInTheDocument();
  });

  it("resets form when dialog is reopened", async () => {
    mockApiResponses({ scenarios: [scenario] });
    const page = EditScenarioDialogPage.render();
    await page.open();

    await page.fillName("Changed");
    await page.pressEscape();

    await page.open();
    expect(page.nameInput).toHaveValue("Test Scenario");
  });

  it("shows delete confirmation dialog", async () => {
    const page = EditScenarioDialogPage.render();
    await page.open();
    await page.clickDelete();

    expect(page.queryDialog()).not.toBeInTheDocument();
    expect(page.getCascadeWarning()).toBeInTheDocument();
  });

  it("deletes scenario and associated transactions", async () => {
    mockApiResponses({
      scenarios: [scenario],
      activeScenarioId: "1",
      transactions: [
        {
          id: "t1",
          accountId: "a1",
          amount: 100,
          date: "2024-01-01",
          description: "Test",
          scenarioId: "1",
        },
      ],
      recurringTransactions: [
        {
          id: "r1",
          accountId: "a1",
          amount: 50,
          description: "Recurring",
          frequency: "monthly",
          startDate: "2024-01-01",
          scenarioId: "1",
        },
      ],
    });
    const page = EditScenarioDialogPage.render();
    await page.open();
    await page.clickDelete();
    await page.confirmDelete();

    expect(screen.queryByText("Test Scenario")).not.toBeInTheDocument();
    expect(page.txCount).toHaveTextContent("0");
    expect(page.rtCount).toHaveTextContent("0");
  });

  it("calls onDelete callback after delete", async () => {
    mockApiResponses({ scenarios: [scenario], activeScenarioId: "1" });
    const onDelete = vi.fn();
    const page = EditScenarioDialogPage.render(scenario, onDelete);
    await page.open();
    await page.clickDelete();
    await page.confirmDelete();

    expect(onDelete).toHaveBeenCalledWith("1");
  });

  it("canceling delete returns to edit dialog", async () => {
    const page = EditScenarioDialogPage.render();
    await page.open();
    await page.clickDelete();
    await page.cancelDelete();

    expect(page.queryCascadeWarning()).not.toBeInTheDocument();
    expect(page.dialog).toBeInTheDocument();
  });

  it("delete confirmation button uses destructive variant", async () => {
    const page = EditScenarioDialogPage.render();
    await page.open();
    await page.clickDelete();

    expect(page.confirmDeleteButton).toHaveClass("bg-destructive");
  });

  it("renders inflation rate input", async () => {
    const page = EditScenarioDialogPage.render();
    await page.open();

    expect(page.inflationRateInput).toBeInTheDocument();
  });

  it("displays existing inflation rate value", async () => {
    const scenarioWithInflation: Scenario = {
      id: "1",
      name: "Test Scenario",
      inflationRate: 3.5,
    };
    const page = EditScenarioDialogPage.render(scenarioWithInflation);
    await page.open();

    expect(page.inflationRateInput).toHaveValue(3.5);
  });

  it("saves updated inflation rate", async () => {
    mockApiResponses({ scenarios: [scenario], activeScenarioId: "1" });
    const page = EditScenarioDialogPage.render();
    await page.open();

    await screen.findByText("Test Scenario");
    await page.fillInflationRate("3");
    await page.save();

    expect(page.queryAnyDialog()).not.toBeInTheDocument();
  });

  it("stops propagation on trigger click", async () => {
    const parentClickHandler = vi.fn();
    const user = userEvent.setup();

    render(
      <div onClick={parentClickHandler}>
        <ScenarioProvider>
          <TransactionProvider>
            <RecurringTransactionProvider>
              <EditScenarioDialog scenario={scenario} />
            </RecurringTransactionProvider>
          </TransactionProvider>
        </ScenarioProvider>
      </div>,
    );

    await user.click(screen.getByRole("button", { name: "Edit Scenario" }));

    expect(parentClickHandler).not.toHaveBeenCalled();
  });
});

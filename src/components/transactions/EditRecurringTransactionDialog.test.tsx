import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach,describe, expect, it } from "vitest";

import { RecurringTransactionProvider } from "@/context/RecurringTransactionContext";
import { ScenarioProvider } from "@/context/ScenarioContext";
import { RecurrenceFrequency } from "@/models/RecurrenceFrequency";
import type { RecurringTransaction } from "@/models/RecurringTransaction.type";

import { EditRecurringTransactionDialog } from "./EditRecurringTransactionDialog";

const mockRecurringTransaction: RecurringTransaction = {
  id: "r1",
  accountId: "a1",
  amount: 5000,
  description: "Salary",
  frequency: RecurrenceFrequency.Monthly,
  startDate: "2024-01-15",
  endDate: "2024-12-31",
};

describe("EditRecurringTransactionDialog", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(
      "recurringTransactions",
      JSON.stringify([mockRecurringTransaction])
    );
  });

  it("opens dialog with current values pre-populated", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <RecurringTransactionProvider>
          <EditRecurringTransactionDialog
            recurringTransaction={mockRecurringTransaction}
          />
        </RecurringTransactionProvider>
      </ScenarioProvider>
    );

    await user.click(screen.getByLabelText("Edit Transaction"));

    expect(screen.getByLabelText("Amount")).toHaveValue("5,000");
    expect(screen.getByLabelText("Description")).toHaveValue("Salary");
    expect(screen.getByLabelText("Start Date")).toHaveValue("2024-01-15");
    expect(screen.getByLabelText("End Date (optional)")).toHaveValue(
      "2024-12-31"
    );
    expect(screen.getByRole("combobox", { name: "Frequency" })).toBeInTheDocument();
  });

  it("updates recurring transaction when saving with new values", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <RecurringTransactionProvider>
          <EditRecurringTransactionDialog
            recurringTransaction={mockRecurringTransaction}
          />
        </RecurringTransactionProvider>
      </ScenarioProvider>
    );

    await user.click(screen.getByLabelText("Edit Transaction"));

    const amountInput = screen.getByLabelText("Amount");
    const descInput = screen.getByLabelText("Description");
    const startDateInput = screen.getByLabelText("Start Date");

    await user.clear(amountInput);
    await user.type(amountInput, "6000");
    await user.clear(descInput);
    await user.type(descInput, "Updated salary");
    await user.clear(startDateInput);
    await user.type(startDateInput, "2024-02-01");

    await user.click(screen.getByText("Save"));

    const stored = JSON.parse(
      localStorage.getItem("recurringTransactions")!
    );
    expect(stored[0]).toMatchObject({
      id: "r1",
      amount: 6000,
      description: "Updated salary",
      startDate: "2024-02-01",
    });
  });

  it("prevents submit when amount is 0", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <RecurringTransactionProvider>
          <EditRecurringTransactionDialog
            recurringTransaction={mockRecurringTransaction}
          />
        </RecurringTransactionProvider>
      </ScenarioProvider>
    );

    await user.click(screen.getByLabelText("Edit Transaction"));

    const amountInput = screen.getByLabelText("Amount");
    await user.clear(amountInput);
    await user.type(amountInput, "0");

    await user.click(screen.getByText("Save"));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes edit dialog before showing delete confirmation", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <RecurringTransactionProvider>
          <EditRecurringTransactionDialog
            recurringTransaction={mockRecurringTransaction}
          />
        </RecurringTransactionProvider>
      </ScenarioProvider>
    );

    await user.click(screen.getByLabelText("Edit Transaction"));
    await user.click(screen.getByText("Delete"));

    expect(screen.queryByLabelText("Amount")).not.toBeInTheDocument();
    expect(screen.getByText("Delete Recurring Transaction")).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete this recurring transaction/)
    ).toBeInTheDocument();
  });

  it("delete confirmation button uses destructive variant", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <RecurringTransactionProvider>
          <EditRecurringTransactionDialog
            recurringTransaction={mockRecurringTransaction}
          />
        </RecurringTransactionProvider>
      </ScenarioProvider>
    );

    await user.click(screen.getByLabelText("Edit Transaction"));
    await user.click(screen.getByText("Delete"));

    const deleteButtons = screen.getAllByText("Delete");
    const confirmButton = deleteButtons[deleteButtons.length - 1];
    expect(confirmButton).toHaveClass("bg-destructive");
  });

  it("removes recurring transaction when confirming delete", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <RecurringTransactionProvider>
          <EditRecurringTransactionDialog
            recurringTransaction={mockRecurringTransaction}
          />
        </RecurringTransactionProvider>
      </ScenarioProvider>
    );

    await user.click(screen.getByLabelText("Edit Transaction"));
    await user.click(screen.getByText("Delete"));

    const deleteButtons = screen.getAllByText("Delete");
    const confirmButton = deleteButtons[deleteButtons.length - 1];
    await user.click(confirmButton);

    const stored = JSON.parse(
      localStorage.getItem("recurringTransactions")!
    );
    expect(stored).toEqual([]);
  });

  it("returns to edit dialog when canceling delete", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <RecurringTransactionProvider>
          <EditRecurringTransactionDialog
            recurringTransaction={mockRecurringTransaction}
          />
        </RecurringTransactionProvider>
      </ScenarioProvider>
    );

    await user.click(screen.getByLabelText("Edit Transaction"));
    await user.click(screen.getByText("Delete"));

    expect(screen.queryByText("Edit Recurring Transaction")).not.toBeInTheDocument();

    await user.click(screen.getByText("Cancel"));

    expect(
      screen.queryByText("Delete Recurring Transaction")
    ).not.toBeInTheDocument();
    expect(screen.getByText("Edit Recurring Transaction")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
  });

  it("resets form when reopening dialog", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <RecurringTransactionProvider>
          <EditRecurringTransactionDialog
            recurringTransaction={mockRecurringTransaction}
          />
        </RecurringTransactionProvider>
      </ScenarioProvider>
    );

    await user.click(screen.getByLabelText("Edit Transaction"));

    const amountInput = screen.getByLabelText("Amount");
    await user.clear(amountInput);
    await user.type(amountInput, "10000");

    await user.keyboard("{Escape}");
    await user.click(screen.getByLabelText("Edit Transaction"));

    expect(screen.getByLabelText("Amount")).toHaveValue("5,000");
  });

  it("updates end date when provided", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <RecurringTransactionProvider>
          <EditRecurringTransactionDialog
            recurringTransaction={mockRecurringTransaction}
          />
        </RecurringTransactionProvider>
      </ScenarioProvider>
    );

    await user.click(screen.getByLabelText("Edit Transaction"));

    const endDateInput = screen.getByLabelText("End Date (optional)");
    await user.clear(endDateInput);
    await user.type(endDateInput, "2025-06-30");

    await user.click(screen.getByText("Save"));

    const stored = JSON.parse(
      localStorage.getItem("recurringTransactions")!
    );
    expect(stored[0]).toMatchObject({
      id: "r1",
      endDate: "2025-06-30",
    });
  });

  it("updates scenario when selecting a specific scenario", async () => {
    const user = userEvent.setup();
    localStorage.setItem("scenarios", JSON.stringify([
      { id: "s1", name: "Test Scenario" }
    ]));

    render(
      <ScenarioProvider>
        <RecurringTransactionProvider>
          <EditRecurringTransactionDialog
            recurringTransaction={mockRecurringTransaction}
          />
        </RecurringTransactionProvider>
      </ScenarioProvider>
    );

    await user.click(screen.getByLabelText("Edit Transaction"));

    const scenarioTrigger = screen.getByRole("combobox", { name: "Scenario" });
    await user.click(scenarioTrigger);

    const scenarioOption = screen.getByRole("option", { name: "Test Scenario" });
    await user.click(scenarioOption);

    await user.click(screen.getByText("Save"));

    const stored = JSON.parse(
      localStorage.getItem("recurringTransactions")!
    );
    expect(stored[0].scenarioId).toBe("s1");
  });

  it('shows "Create new scenario..." option in scenario dropdown', async () => {
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <RecurringTransactionProvider>
          <EditRecurringTransactionDialog
            recurringTransaction={mockRecurringTransaction}
          />
        </RecurringTransactionProvider>
      </ScenarioProvider>
    );

    await user.click(screen.getByLabelText("Edit Transaction"));
    await user.click(screen.getByRole("combobox", { name: "Scenario" }));

    expect(screen.getByRole("option", { name: "Create new scenario..." })).toBeInTheDocument();
  });

  it("creates scenario inline and auto-selects it", async () => {
    const user = userEvent.setup();

    render(
      <ScenarioProvider>
        <RecurringTransactionProvider>
          <EditRecurringTransactionDialog
            recurringTransaction={mockRecurringTransaction}
          />
        </RecurringTransactionProvider>
      </ScenarioProvider>
    );

    await user.click(screen.getByLabelText("Edit Transaction"));

    await user.click(screen.getByRole("combobox", { name: "Scenario" }));
    await user.click(screen.getByRole("option", { name: "Create new scenario..." }));

    const input = screen.getByLabelText(/scenario name/i);
    await user.type(input, "Early Retirement");
    await user.click(screen.getByRole("button", { name: /create/i }));

    // Verify scenario was created in storage
    const scenarios = JSON.parse(localStorage.getItem("scenarios")!);
    const createdScenario = scenarios.find((s: { name: string }) => s.name === "Early Retirement");
    expect(createdScenario).toBeDefined();

    // Save recurring transaction and verify scenario ID was set
    await user.click(screen.getByText("Save"));

    const stored = JSON.parse(
      localStorage.getItem("recurringTransactions")!
    );
    expect(stored[0].scenarioId).toBe(createdScenario.id);
  });
});

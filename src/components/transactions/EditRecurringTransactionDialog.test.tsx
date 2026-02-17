import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RecurrenceFrequency } from "@/recurring-transactions/RecurrenceFrequency";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";

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

function renderDialog(
  overrides: Partial<React.ComponentProps<typeof EditRecurringTransactionDialog>> = {},
) {
  const props = {
    recurringTransaction: mockRecurringTransaction,
    scenarios: [],
    onSave: vi.fn(),
    onDelete: vi.fn(),
    onCreateScenario: vi.fn(),
    ...overrides,
  };
  render(<EditRecurringTransactionDialog {...props} />);
  return props;
}

describe("EditRecurringTransactionDialog", () => {
  it("opens dialog with current values pre-populated", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByLabelText("Edit Transaction"));

    expect(screen.getByLabelText("Amount")).toHaveValue("5,000");
    expect(screen.getByLabelText("Description")).toHaveValue("Salary");
    expect(screen.getByLabelText("Start Date")).toHaveValue("2024-01-15");
    expect(screen.getByLabelText("End Date (optional)")).toHaveValue("2024-12-31");
    expect(screen.getByRole("combobox", { name: "Frequency" })).toBeInTheDocument();
  });

  it("calls onSave with updated recurring transaction when saving", async () => {
    const user = userEvent.setup();
    const { onSave } = renderDialog();

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

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "r1",
        amount: 6000,
        description: "Updated salary",
        startDate: "2024-02-01",
      }),
    );
  });

  it("prevents submit when amount is 0", async () => {
    const user = userEvent.setup();
    const { onSave } = renderDialog();

    await user.click(screen.getByLabelText("Edit Transaction"));

    const amountInput = screen.getByLabelText("Amount");
    await user.clear(amountInput);
    await user.type(amountInput, "0");

    await user.click(screen.getByText("Save"));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes edit dialog before showing delete confirmation", async () => {
    const user = userEvent.setup();
    renderDialog();

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
    renderDialog();

    await user.click(screen.getByLabelText("Edit Transaction"));
    await user.click(screen.getByText("Delete"));

    const deleteButtons = screen.getAllByText("Delete");
    const confirmButton = deleteButtons[deleteButtons.length - 1];
    expect(confirmButton).toHaveClass("bg-destructive");
  });

  it("calls onDelete with recurring transaction id when confirming delete", async () => {
    const user = userEvent.setup();
    const { onDelete } = renderDialog();

    await user.click(screen.getByLabelText("Edit Transaction"));
    await user.click(screen.getByText("Delete"));

    const deleteButtons = screen.getAllByText("Delete");
    const confirmButton = deleteButtons[deleteButtons.length - 1];
    await user.click(confirmButton);

    expect(onDelete).toHaveBeenCalledWith("r1");
  });

  it("returns to edit dialog when canceling delete", async () => {
    const user = userEvent.setup();
    renderDialog();

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
    renderDialog();

    await user.click(screen.getByLabelText("Edit Transaction"));

    const amountInput = screen.getByLabelText("Amount");
    await user.clear(amountInput);
    await user.type(amountInput, "10000");

    await user.keyboard("{Escape}");
    await user.click(screen.getByLabelText("Edit Transaction"));

    expect(screen.getByLabelText("Amount")).toHaveValue("5,000");
  });

  it("calls onSave with updated end date", async () => {
    const user = userEvent.setup();
    const { onSave } = renderDialog();

    await user.click(screen.getByLabelText("Edit Transaction"));

    const endDateInput = screen.getByLabelText("End Date (optional)");
    await user.clear(endDateInput);
    await user.type(endDateInput, "2025-06-30");

    await user.click(screen.getByText("Save"));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ endDate: "2025-06-30" }),
    );
  });

  it("calls onSave with scenarioId when selecting a scenario", async () => {
    const user = userEvent.setup();
    const { onSave } = renderDialog({
      scenarios: [{ id: "s1", name: "Test Scenario" }],
    });

    await user.click(screen.getByLabelText("Edit Transaction"));

    const scenarioTrigger = screen.getByRole("combobox", { name: "Scenario" });
    await user.click(scenarioTrigger);

    const scenarioOption = await screen.findByRole("option", { name: "Test Scenario" });
    await user.click(scenarioOption);

    await user.click(screen.getByText("Save"));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ scenarioId: "s1" }),
    );
  });

  it('shows "Create new scenario..." option in scenario dropdown', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByLabelText("Edit Transaction"));
    await user.click(screen.getByRole("combobox", { name: "Scenario" }));

    expect(screen.getByRole("option", { name: "Create new scenario..." })).toBeInTheDocument();
  });

  it("creates scenario inline and auto-selects it", async () => {
    const user = userEvent.setup();
    const { onSave, onCreateScenario } = renderDialog();

    await user.click(screen.getByLabelText("Edit Transaction"));

    await user.click(screen.getByRole("combobox", { name: "Scenario" }));
    await user.click(screen.getByRole("option", { name: "Create new scenario..." }));

    const input = screen.getByLabelText(/scenario name/i);
    await user.type(input, "Early Retirement");
    await user.click(screen.getByRole("button", { name: /create/i }));

    expect(onCreateScenario).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Early Retirement" }),
    );
    const createdScenarioId = onCreateScenario.mock.calls[0][0].id;

    await user.click(screen.getByText("Save"));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ scenarioId: createdScenarioId }),
    );
  });
});

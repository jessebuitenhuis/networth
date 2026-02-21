import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { Transaction } from "@/transactions/Transaction.type";

import { EditTransactionDialog } from "./EditTransactionDialog";

const mockTransaction: Transaction = {
  id: "t1",
  accountId: "a1",
  amount: 1000,
  date: "2024-01-15",
  description: "Test transaction",
};

function renderDialog(overrides: Partial<React.ComponentProps<typeof EditTransactionDialog>> = {}) {
  const props = {
    transaction: mockTransaction,
    scenarios: [],
    categories: [],
    onSave: vi.fn(),
    onDelete: vi.fn(),
    onCreateScenario: vi.fn(),
    onCreateCategory: vi.fn(),
    ...overrides,
  };
  render(<EditTransactionDialog {...props} />);
  return props;
}

describe("EditTransactionDialog", () => {
  it("opens dialog with current values pre-populated", () => {
    renderDialog();

    act(() => screen.getByLabelText("Edit Transaction").click());

    expect(screen.getByLabelText("Amount")).toHaveValue("1,000");
    expect(screen.getByLabelText("Date")).toHaveValue("2024-01-15");
    expect(screen.getByLabelText("Description")).toHaveValue("Test transaction");
  });

  it("calls onSave with updated transaction when saving", async () => {
    const user = userEvent.setup();
    const { onSave } = renderDialog();

    await user.click(screen.getByLabelText("Edit Transaction"));

    const amountInput = screen.getByLabelText("Amount");
    const dateInput = screen.getByLabelText("Date");
    const descInput = screen.getByLabelText("Description");

    await user.clear(amountInput);
    await user.type(amountInput, "1500");
    await user.clear(dateInput);
    await user.type(dateInput, "2024-01-20");
    await user.clear(descInput);
    await user.type(descInput, "Updated transaction");

    await user.click(screen.getByText("Save"));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "t1",
        amount: 1500,
        date: "2024-01-20",
        description: "Updated transaction",
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

  it("closes edit dialog before showing delete confirmation", () => {
    renderDialog();

    act(() => screen.getByLabelText("Edit Transaction").click());
    act(() => screen.getByText("Delete").click());

    expect(screen.queryByLabelText("Amount")).not.toBeInTheDocument();
    expect(screen.getByText("Delete Transaction")).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete this transaction/)).toBeInTheDocument();
  });

  it("delete confirmation button uses destructive variant", () => {
    renderDialog();

    act(() => screen.getByLabelText("Edit Transaction").click());
    act(() => screen.getByText("Delete").click());

    const deleteButtons = screen.getAllByText("Delete");
    const confirmButton = deleteButtons[deleteButtons.length - 1];
    expect(confirmButton).toHaveClass("bg-destructive");
  });

  it("calls onDelete with transaction id when confirming delete", async () => {
    const { onDelete } = renderDialog();

    act(() => screen.getByLabelText("Edit Transaction").click());
    act(() => screen.getByText("Delete").click());

    const deleteButtons = screen.getAllByText("Delete");
    const confirmButton = deleteButtons[deleteButtons.length - 1];
    await act(async () => confirmButton.click());

    expect(onDelete).toHaveBeenCalledWith("t1");
  });

  it("returns to edit dialog when canceling delete", () => {
    renderDialog();

    act(() => screen.getByLabelText("Edit Transaction").click());
    act(() => screen.getByText("Delete").click());

    expect(screen.queryByText("Edit Transaction")).not.toBeInTheDocument();

    act(() => screen.getByText("Cancel").click());

    expect(screen.queryByText("Delete Transaction")).not.toBeInTheDocument();
    expect(screen.getByText("Edit Transaction")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
  });

  it("resets form when reopening dialog", () => {
    renderDialog();

    act(() => screen.getByLabelText("Edit Transaction").click());

    const amountInput = screen.getByLabelText("Amount") as HTMLInputElement;
    act(() => {
      amountInput.value = "5000";
      amountInput.dispatchEvent(new Event("change", { bubbles: true }));
    });

    act(() => {
      const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true });
      document.dispatchEvent(event);
    });

    act(() => screen.getByLabelText("Edit Transaction").click());

    expect(screen.getByLabelText("Amount")).toHaveValue("1,000");
  });

  it("trims whitespace from description when saving", async () => {
    const user = userEvent.setup();
    const { onSave } = renderDialog();

    await user.click(screen.getByLabelText("Edit Transaction"));

    const descInput = screen.getByLabelText("Description");
    await user.clear(descInput);
    await user.type(descInput, "  Padded Description  ");

    await user.click(screen.getByText("Save"));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ description: "Padded Description" }),
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
    await user.type(input, "Retirement Plan");
    await user.click(screen.getByRole("button", { name: /create/i }));

    expect(onCreateScenario).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Retirement Plan" }),
    );
    const createdScenarioId = onCreateScenario.mock.calls[0][0].id;

    await user.click(screen.getByText("Save"));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ scenarioId: createdScenarioId }),
    );
  });
});

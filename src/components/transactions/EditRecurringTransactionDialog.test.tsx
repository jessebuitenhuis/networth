import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach } from "vitest";
import { EditRecurringTransactionDialog } from "./EditRecurringTransactionDialog";
import { RecurringTransactionProvider } from "@/context/RecurringTransactionContext";
import type { RecurringTransaction } from "@/models/RecurringTransaction";
import { RecurrenceFrequency } from "@/models/RecurrenceFrequency";

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
      <RecurringTransactionProvider>
        <EditRecurringTransactionDialog
          recurringTransaction={mockRecurringTransaction}
        />
      </RecurringTransactionProvider>
    );

    await user.click(screen.getByLabelText("Edit Transaction"));

    expect(screen.getByLabelText("Amount")).toHaveValue(5000);
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
      <RecurringTransactionProvider>
        <EditRecurringTransactionDialog
          recurringTransaction={mockRecurringTransaction}
        />
      </RecurringTransactionProvider>
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
      <RecurringTransactionProvider>
        <EditRecurringTransactionDialog
          recurringTransaction={mockRecurringTransaction}
        />
      </RecurringTransactionProvider>
    );

    await user.click(screen.getByLabelText("Edit Transaction"));

    const amountInput = screen.getByLabelText("Amount");
    await user.clear(amountInput);
    await user.type(amountInput, "0");

    await user.click(screen.getByText("Save"));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows confirmation dialog when clicking delete", async () => {
    const user = userEvent.setup();
    render(
      <RecurringTransactionProvider>
        <EditRecurringTransactionDialog
          recurringTransaction={mockRecurringTransaction}
        />
      </RecurringTransactionProvider>
    );

    await user.click(screen.getByLabelText("Edit Transaction"));
    await user.click(screen.getByText("Delete"));

    expect(screen.getByText("Delete Recurring Transaction")).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete this recurring transaction/)
    ).toBeInTheDocument();
  });

  it("removes recurring transaction when confirming delete", async () => {
    const user = userEvent.setup();
    render(
      <RecurringTransactionProvider>
        <EditRecurringTransactionDialog
          recurringTransaction={mockRecurringTransaction}
        />
      </RecurringTransactionProvider>
    );

    await user.click(screen.getByLabelText("Edit Transaction"));
    await user.click(screen.getByText("Delete"));
    await user.click(screen.getByText("Continue"));

    const stored = JSON.parse(
      localStorage.getItem("recurringTransactions")!
    );
    expect(stored).toEqual([]);
  });

  it("returns to edit dialog when canceling delete", async () => {
    const user = userEvent.setup();
    render(
      <RecurringTransactionProvider>
        <EditRecurringTransactionDialog
          recurringTransaction={mockRecurringTransaction}
        />
      </RecurringTransactionProvider>
    );

    await user.click(screen.getByLabelText("Edit Transaction"));
    await user.click(screen.getByText("Delete"));
    await user.click(screen.getByText("Cancel"));

    expect(
      screen.queryByText("Delete Recurring Transaction")
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
  });

  it("resets form when reopening dialog", async () => {
    const user = userEvent.setup();
    render(
      <RecurringTransactionProvider>
        <EditRecurringTransactionDialog
          recurringTransaction={mockRecurringTransaction}
        />
      </RecurringTransactionProvider>
    );

    await user.click(screen.getByLabelText("Edit Transaction"));

    const amountInput = screen.getByLabelText("Amount");
    await user.clear(amountInput);
    await user.type(amountInput, "10000");

    await user.keyboard("{Escape}");
    await user.click(screen.getByLabelText("Edit Transaction"));

    expect(screen.getByLabelText("Amount")).toHaveValue(5000);
  });
});

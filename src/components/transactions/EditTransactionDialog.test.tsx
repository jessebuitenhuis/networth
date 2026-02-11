import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach } from "vitest";
import { EditTransactionDialog } from "./EditTransactionDialog";
import { TransactionProvider } from "@/context/TransactionContext";
import type { Transaction } from "@/models/Transaction";

const mockTransaction: Transaction = {
  id: "t1",
  accountId: "a1",
  amount: 1000,
  date: "2024-01-15",
  description: "Test transaction",
};

describe("EditTransactionDialog", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("transactions", JSON.stringify([mockTransaction]));
  });

  it("opens dialog with current values pre-populated", () => {
    render(
      <TransactionProvider>
        <EditTransactionDialog transaction={mockTransaction} />
      </TransactionProvider>
    );

    act(() => screen.getByLabelText("Edit Transaction").click());

    expect(screen.getByLabelText("Amount")).toHaveValue(1000);
    expect(screen.getByLabelText("Date")).toHaveValue("2024-01-15");
    expect(screen.getByLabelText("Description")).toHaveValue("Test transaction");
  });

  it("updates transaction when saving with new values", async () => {
    const user = userEvent.setup();
    render(
      <TransactionProvider>
        <EditTransactionDialog transaction={mockTransaction} />
      </TransactionProvider>
    );

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

    const stored = JSON.parse(localStorage.getItem("transactions")!);
    expect(stored[0]).toMatchObject({
      id: "t1",
      amount: 1500,
      date: "2024-01-20",
      description: "Updated transaction",
    });
  });

  it("prevents submit when amount is 0", async () => {
    const user = userEvent.setup();
    render(
      <TransactionProvider>
        <EditTransactionDialog transaction={mockTransaction} />
      </TransactionProvider>
    );

    await user.click(screen.getByLabelText("Edit Transaction"));

    const amountInput = screen.getByLabelText("Amount");
    await user.clear(amountInput);
    await user.type(amountInput, "0");

    await user.click(screen.getByText("Save"));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
  });

  it("shows confirmation dialog when clicking delete", () => {
    render(
      <TransactionProvider>
        <EditTransactionDialog transaction={mockTransaction} />
      </TransactionProvider>
    );

    act(() => screen.getByLabelText("Edit Transaction").click());
    act(() => screen.getByText("Delete").click());

    expect(screen.getByText("Delete Transaction")).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete this transaction/)).toBeInTheDocument();
  });

  it("removes transaction when confirming delete", () => {
    render(
      <TransactionProvider>
        <EditTransactionDialog transaction={mockTransaction} />
      </TransactionProvider>
    );

    act(() => screen.getByLabelText("Edit Transaction").click());
    act(() => screen.getByText("Delete").click());
    act(() => screen.getByText("Continue").click());

    const stored = JSON.parse(localStorage.getItem("transactions")!);
    expect(stored).toEqual([]);
  });

  it("returns to edit dialog when canceling delete", () => {
    render(
      <TransactionProvider>
        <EditTransactionDialog transaction={mockTransaction} />
      </TransactionProvider>
    );

    act(() => screen.getByLabelText("Edit Transaction").click());
    act(() => screen.getByText("Delete").click());
    act(() => screen.getByText("Cancel").click());

    expect(screen.queryByText("Delete Transaction")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
  });

  it("resets form when reopening dialog", () => {
    render(
      <TransactionProvider>
        <EditTransactionDialog transaction={mockTransaction} />
      </TransactionProvider>
    );

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

    expect(screen.getByLabelText("Amount")).toHaveValue(1000);
  });
});

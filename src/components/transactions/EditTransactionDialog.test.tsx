import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ScenarioProvider } from "@/scenarios/ScenarioContext";
import { mockApiResponses } from "@/test/mocks/mockApiResponses";
import type { Transaction } from "@/transactions/Transaction.type";
import { TransactionProvider } from "@/transactions/TransactionContext";

import { EditTransactionDialog } from "./EditTransactionDialog";

const mockTransaction: Transaction = {
  id: "t1",
  accountId: "a1",
  amount: 1000,
  date: "2024-01-15",
  description: "Test transaction",
};

describe("EditTransactionDialog", () => {
  beforeEach(() => {
    mockApiResponses({ transactions: [mockTransaction] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens dialog with current values pre-populated", () => {
    render(
      <ScenarioProvider>
        <TransactionProvider>
          <EditTransactionDialog transaction={mockTransaction} />
        </TransactionProvider>
      </ScenarioProvider>,
    );

    act(() => screen.getByLabelText("Edit Transaction").click());

    expect(screen.getByLabelText("Amount")).toHaveValue("1,000");
    expect(screen.getByLabelText("Date")).toHaveValue("2024-01-15");
    expect(screen.getByLabelText("Description")).toHaveValue("Test transaction");
  });

  it("updates transaction when saving with new values", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <TransactionProvider>
          <EditTransactionDialog transaction={mockTransaction} />
        </TransactionProvider>
      </ScenarioProvider>,
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

    const putCalls = vi.mocked(globalThis.fetch).mock.calls.filter(
      ([url, init]) => url === "/api/transactions/t1" && init?.method === "PUT",
    );
    expect(putCalls).toHaveLength(1);
    const body = JSON.parse(putCalls[0][1]!.body as string);
    expect(body).toMatchObject({
      id: "t1",
      amount: 1500,
      date: "2024-01-20",
      description: "Updated transaction",
    });
  });

  it("prevents submit when amount is 0", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <TransactionProvider>
          <EditTransactionDialog transaction={mockTransaction} />
        </TransactionProvider>
      </ScenarioProvider>,
    );

    await user.click(screen.getByLabelText("Edit Transaction"));

    const amountInput = screen.getByLabelText("Amount");
    await user.clear(amountInput);
    await user.type(amountInput, "0");

    await user.click(screen.getByText("Save"));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
  });

  it("closes edit dialog before showing delete confirmation", () => {
    render(
      <ScenarioProvider>
        <TransactionProvider>
          <EditTransactionDialog transaction={mockTransaction} />
        </TransactionProvider>
      </ScenarioProvider>,
    );

    act(() => screen.getByLabelText("Edit Transaction").click());
    act(() => screen.getByText("Delete").click());

    expect(screen.queryByLabelText("Amount")).not.toBeInTheDocument();
    expect(screen.getByText("Delete Transaction")).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete this transaction/)).toBeInTheDocument();
  });

  it("delete confirmation button uses destructive variant", () => {
    render(
      <ScenarioProvider>
        <TransactionProvider>
          <EditTransactionDialog transaction={mockTransaction} />
        </TransactionProvider>
      </ScenarioProvider>,
    );

    act(() => screen.getByLabelText("Edit Transaction").click());
    act(() => screen.getByText("Delete").click());

    const deleteButtons = screen.getAllByText("Delete");
    const confirmButton = deleteButtons[deleteButtons.length - 1];
    expect(confirmButton).toHaveClass("bg-destructive");
  });

  it("removes transaction when confirming delete", async () => {
    render(
      <ScenarioProvider>
        <TransactionProvider>
          <EditTransactionDialog transaction={mockTransaction} />
        </TransactionProvider>
      </ScenarioProvider>,
    );

    act(() => screen.getByLabelText("Edit Transaction").click());
    act(() => screen.getByText("Delete").click());

    const deleteButtons = screen.getAllByText("Delete");
    const confirmButton = deleteButtons[deleteButtons.length - 1];
    await act(async () => confirmButton.click());

    const deleteCalls = vi.mocked(globalThis.fetch).mock.calls.filter(
      ([url, init]) => url === "/api/transactions/t1" && init?.method === "DELETE",
    );
    expect(deleteCalls).toHaveLength(1);
  });

  it("returns to edit dialog when canceling delete", () => {
    render(
      <ScenarioProvider>
        <TransactionProvider>
          <EditTransactionDialog transaction={mockTransaction} />
        </TransactionProvider>
      </ScenarioProvider>,
    );

    act(() => screen.getByLabelText("Edit Transaction").click());
    act(() => screen.getByText("Delete").click());

    expect(screen.queryByText("Edit Transaction")).not.toBeInTheDocument();

    act(() => screen.getByText("Cancel").click());

    expect(screen.queryByText("Delete Transaction")).not.toBeInTheDocument();
    expect(screen.getByText("Edit Transaction")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
  });

  it("resets form when reopening dialog", () => {
    render(
      <ScenarioProvider>
        <TransactionProvider>
          <EditTransactionDialog transaction={mockTransaction} />
        </TransactionProvider>
      </ScenarioProvider>,
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

    expect(screen.getByLabelText("Amount")).toHaveValue("1,000");
  });

  it("trims whitespace from description when saving", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <TransactionProvider>
          <EditTransactionDialog transaction={mockTransaction} />
        </TransactionProvider>
      </ScenarioProvider>,
    );

    await user.click(screen.getByLabelText("Edit Transaction"));

    const descInput = screen.getByLabelText("Description");
    await user.clear(descInput);
    await user.type(descInput, "  Padded Description  ");

    await user.click(screen.getByText("Save"));

    const putCalls = vi.mocked(globalThis.fetch).mock.calls.filter(
      ([url, init]) => url === "/api/transactions/t1" && init?.method === "PUT",
    );
    expect(putCalls).toHaveLength(1);
    const body = JSON.parse(putCalls[0][1]!.body as string);
    expect(body.description).toBe("Padded Description");
  });

  it("updates scenario when selecting a specific scenario", async () => {
    const user = userEvent.setup();
    mockApiResponses({
      transactions: [mockTransaction],
      scenarios: [{ id: "s1", name: "Test Scenario" }],
    });

    render(
      <ScenarioProvider>
        <TransactionProvider>
          <EditTransactionDialog transaction={mockTransaction} />
        </TransactionProvider>
      </ScenarioProvider>,
    );

    await user.click(screen.getByLabelText("Edit Transaction"));

    const scenarioTrigger = screen.getByRole("combobox", { name: "Scenario" });
    await user.click(scenarioTrigger);

    const scenarioOption = await screen.findByRole("option", { name: "Test Scenario" });
    await user.click(scenarioOption);

    await user.click(screen.getByText("Save"));

    const putCalls = vi.mocked(globalThis.fetch).mock.calls.filter(
      ([url, init]) => url === "/api/transactions/t1" && init?.method === "PUT",
    );
    expect(putCalls).toHaveLength(1);
    const body = JSON.parse(putCalls[0][1]!.body as string);
    expect(body.scenarioId).toBe("s1");
  });

  it('shows "Create new scenario..." option in scenario dropdown', async () => {
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <TransactionProvider>
          <EditTransactionDialog transaction={mockTransaction} />
        </TransactionProvider>
      </ScenarioProvider>,
    );

    await user.click(screen.getByLabelText("Edit Transaction"));
    await user.click(screen.getByRole("combobox", { name: "Scenario" }));

    expect(screen.getByRole("option", { name: "Create new scenario..." })).toBeInTheDocument();
  });

  it("creates scenario inline and auto-selects it", async () => {
    const user = userEvent.setup();

    render(
      <ScenarioProvider>
        <TransactionProvider>
          <EditTransactionDialog transaction={mockTransaction} />
        </TransactionProvider>
      </ScenarioProvider>,
    );

    await user.click(screen.getByLabelText("Edit Transaction"));

    await user.click(screen.getByRole("combobox", { name: "Scenario" }));
    await user.click(screen.getByRole("option", { name: "Create new scenario..." }));

    const input = screen.getByLabelText(/scenario name/i);
    await user.type(input, "Retirement Plan");
    await user.click(screen.getByRole("button", { name: /create/i }));

    // Verify scenario was created via API
    const scenarioPostCalls = vi.mocked(globalThis.fetch).mock.calls.filter(
      ([url, init]) => url === "/api/scenarios" && init?.method === "POST",
    );
    expect(scenarioPostCalls).toHaveLength(1);
    const scenarioBody = JSON.parse(scenarioPostCalls[0][1]!.body as string);
    expect(scenarioBody.name).toBe("Retirement Plan");
    const createdScenarioId = scenarioBody.id;

    // Save transaction and verify scenario ID was set
    await user.click(screen.getByText("Save"));

    const putCalls = vi.mocked(globalThis.fetch).mock.calls.filter(
      ([url, init]) => url === "/api/transactions/t1" && init?.method === "PUT",
    );
    expect(putCalls).toHaveLength(1);
    const txBody = JSON.parse(putCalls[0][1]!.body as string);
    expect(txBody.scenarioId).toBe(createdScenarioId);
  });
});

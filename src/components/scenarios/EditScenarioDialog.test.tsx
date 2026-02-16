import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  RecurringTransactionProvider,
  useRecurringTransactions,
} from "@/recurring-transactions/RecurringTransactionContext";
import type { Scenario } from "@/scenarios/Scenario.type";
import { ScenarioProvider, useScenarios } from "@/scenarios/ScenarioContext";
import {
  TransactionProvider,
  useTransactions,
} from "@/transactions/TransactionContext";

import { EditScenarioDialog } from "./EditScenarioDialog";

const scenario: Scenario = {
  id: "1",
  name: "Test Scenario",
};

function TestHarness({
  scenario,
  onDelete,
}: {
  scenario: Scenario;
  onDelete?: (id: string) => void;
}) {
  const { scenarios } = useScenarios();
  const { transactions } = useTransactions();
  const { recurringTransactions } = useRecurringTransactions();
  return (
    <div>
      <EditScenarioDialog scenario={scenario} onDelete={onDelete} />
      <ul data-testid="scenarios">
        {scenarios.map((s) => (
          <li key={s.id}>{s.name}</li>
        ))}
      </ul>
      <span data-testid="tx-count">{transactions.length}</span>
      <span data-testid="rt-count">{recurringTransactions.length}</span>
    </div>
  );
}

function renderDialog(s: Scenario = scenario, onDelete?: (id: string) => void) {
  return render(
    <ScenarioProvider>
      <TransactionProvider>
        <RecurringTransactionProvider>
          <TestHarness scenario={s} onDelete={onDelete} />
        </RecurringTransactionProvider>
      </TransactionProvider>
    </ScenarioProvider>
  );
}

async function openDialog(s: Scenario = scenario, onDelete?: (id: string) => void) {
  const user = userEvent.setup();
  renderDialog(s, onDelete);
  await user.click(screen.getByRole("button", { name: "Edit Scenario" }));
  return user;
}

describe("EditScenarioDialog", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders pencil trigger with correct size and aria-label", () => {
    renderDialog();
    const button = screen.getByRole("button", { name: "Edit Scenario" });
    expect(button).toBeInTheDocument();
    expect(button.className).toContain("h-6");
    expect(button.className).toContain("w-6");
  });

  it("opens dialog with current name pre-populated", async () => {
    await openDialog();

    expect(
      screen.getByRole("dialog", { name: "Edit Scenario" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("Test Scenario");
  });

  it("saves updated name", async () => {
    localStorage.setItem("scenarios", JSON.stringify([scenario]));
    localStorage.setItem("activeScenarioId", "1");
    const user = await openDialog();

    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "Updated Name");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Updated Name")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("trims whitespace from name", async () => {
    localStorage.setItem("scenarios", JSON.stringify([scenario]));
    localStorage.setItem("activeScenarioId", "1");
    const user = await openDialog();

    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "  Trimmed  ");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Trimmed")).toBeInTheDocument();
  });

  it("empty name prevents submit", async () => {
    localStorage.setItem("scenarios", JSON.stringify([scenario]));
    const user = await openDialog();

    await user.clear(screen.getByLabelText("Name"));
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Test Scenario")).toBeInTheDocument();
  });

  it("resets form when dialog is reopened", async () => {
    localStorage.setItem("scenarios", JSON.stringify([scenario]));
    const user = await openDialog();

    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "Changed");
    await user.keyboard("{Escape}");

    await user.click(screen.getByRole("button", { name: "Edit Scenario" }));
    expect(screen.getByLabelText("Name")).toHaveValue("Test Scenario");
  });

  it("shows delete confirmation dialog", async () => {
    const user = await openDialog();

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(
      screen.queryByRole("dialog", { name: "Edit Scenario" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/all associated transactions will be permanently removed/i)
    ).toBeInTheDocument();
  });

  it("deletes scenario and associated transactions", async () => {
    localStorage.setItem("scenarios", JSON.stringify([scenario]));
    localStorage.setItem("activeScenarioId", "1");
    localStorage.setItem(
      "transactions",
      JSON.stringify([
        {
          id: "t1",
          accountId: "a1",
          amount: 100,
          date: "2024-01-01",
          description: "Test",
          scenarioId: "1",
        },
      ])
    );
    localStorage.setItem(
      "recurringTransactions",
      JSON.stringify([
        {
          id: "r1",
          accountId: "a1",
          amount: 50,
          description: "Recurring",
          frequency: "monthly",
          startDate: "2024-01-01",
          scenarioId: "1",
        },
      ])
    );
    const user = await openDialog();

    await user.click(screen.getByRole("button", { name: "Delete" }));
    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    await user.click(deleteButtons[deleteButtons.length - 1]);

    expect(screen.queryByText("Test Scenario")).not.toBeInTheDocument();
    expect(screen.getByTestId("tx-count")).toHaveTextContent("0");
    expect(screen.getByTestId("rt-count")).toHaveTextContent("0");
  });

  it("calls onDelete callback after delete", async () => {
    localStorage.setItem("scenarios", JSON.stringify([scenario]));
    localStorage.setItem("activeScenarioId", "1");
    const onDelete = vi.fn();
    const user = await openDialog(scenario, onDelete);

    await user.click(screen.getByRole("button", { name: "Delete" }));
    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    await user.click(deleteButtons[deleteButtons.length - 1]);

    expect(onDelete).toHaveBeenCalledWith("1");
  });

  it("canceling delete returns to edit dialog", async () => {
    const user = await openDialog();

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      screen.queryByText(/all associated transactions will be permanently removed/i)
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("dialog", { name: "Edit Scenario" })
    ).toBeInTheDocument();
  });

  it("delete confirmation button uses destructive variant", async () => {
    const user = await openDialog();

    await user.click(screen.getByRole("button", { name: "Delete" }));

    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    const confirmButton = deleteButtons[deleteButtons.length - 1];
    expect(confirmButton).toHaveClass("bg-destructive");
  });

  it("stops propagation on trigger click", async () => {
    const parentClickHandler = vi.fn();
    const user = userEvent.setup();

    render(
      <div onClick={parentClickHandler}>
        <ScenarioProvider>
          <TransactionProvider>
            <RecurringTransactionProvider>
              <TestHarness scenario={scenario} />
            </RecurringTransactionProvider>
          </TransactionProvider>
        </ScenarioProvider>
      </div>
    );

    await user.click(screen.getByRole("button", { name: "Edit Scenario" }));

    // Should not propagate to parent (Popover)
    expect(parentClickHandler).not.toHaveBeenCalled();
  });
});

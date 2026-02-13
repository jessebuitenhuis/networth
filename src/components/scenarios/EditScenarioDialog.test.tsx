import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import {
  RecurringTransactionProvider,
  useRecurringTransactions,
} from "@/context/RecurringTransactionContext";
import { ScenarioProvider, useScenarios } from "@/context/ScenarioContext";
import {
  TransactionProvider,
  useTransactions,
} from "@/context/TransactionContext";
import type { Scenario } from "@/models/Scenario.type";

import { EditScenarioDialog } from "./EditScenarioDialog";

const scenario: Scenario = {
  id: "1",
  name: "Test Scenario",
};

function TestHarness({ scenario }: { scenario: Scenario }) {
  const { scenarios, activeScenarioId } = useScenarios();
  const { transactions } = useTransactions();
  const { recurringTransactions } = useRecurringTransactions();
  return (
    <div>
      <EditScenarioDialog scenario={scenario} />
      <ul data-testid="scenarios">
        {scenarios.map((s) => (
          <li key={s.id}>{s.name}</li>
        ))}
      </ul>
      <span data-testid="active">{activeScenarioId ?? "null"}</span>
      <span data-testid="tx-count">{transactions.length}</span>
      <span data-testid="rt-count">{recurringTransactions.length}</span>
    </div>
  );
}

function renderDialog(s: Scenario = scenario) {
  return render(
    <ScenarioProvider>
      <TransactionProvider>
        <RecurringTransactionProvider>
          <TestHarness scenario={s} />
        </RecurringTransactionProvider>
      </TransactionProvider>
    </ScenarioProvider>
  );
}

async function openDialog(s: Scenario = scenario) {
  const user = userEvent.setup();
  renderDialog(s);
  await user.click(screen.getByRole("button", { name: "Edit Scenario" }));
  return user;
}

describe("EditScenarioDialog", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders pencil trigger with correct aria-label", () => {
    renderDialog();
    expect(
      screen.getByRole("button", { name: "Edit Scenario" })
    ).toBeInTheDocument();
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

  it("sets active to null after delete", async () => {
    localStorage.setItem("scenarios", JSON.stringify([scenario]));
    localStorage.setItem("activeScenarioId", "1");
    const user = await openDialog();

    await user.click(screen.getByRole("button", { name: "Delete" }));
    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    await user.click(deleteButtons[deleteButtons.length - 1]);

    expect(screen.getByTestId("active")).toHaveTextContent("null");
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
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach,describe, expect, it, vi } from "vitest";

import { AccountProvider } from "@/context/AccountContext";
import { RecurringTransactionProvider } from "@/context/RecurringTransactionContext";
import { ScenarioProvider } from "@/context/ScenarioContext";
import { TransactionProvider } from "@/context/TransactionContext";
import type { RecurringTransaction } from "@/models/RecurringTransaction.type";
import type { Transaction } from "@/models/Transaction.type";
import * as AccountStorage from "@/services/AccountStorage";
import * as RecurringTransactionStorage from "@/services/RecurringTransactionStorage";
import { ScenarioStorage } from "@/services/ScenarioStorage";
import * as TransactionStorage from "@/services/TransactionStorage";

import { DuplicateScenarioDialog } from "./DuplicateScenarioDialog";

vi.mock("@/services/ScenarioStorage");
vi.mock("@/services/TransactionStorage");
vi.mock("@/services/RecurringTransactionStorage");
vi.mock("@/services/AccountStorage");

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <AccountProvider>
      <TransactionProvider>
        <ScenarioProvider>
          <RecurringTransactionProvider>{children}</RecurringTransactionProvider>
        </ScenarioProvider>
      </TransactionProvider>
    </AccountProvider>
  );
}

describe("DuplicateScenarioDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(AccountStorage).loadAccounts.mockReturnValue([]);
    vi.mocked(AccountStorage).migrateAccountBalances.mockReturnValue([]);
    vi.mocked(TransactionStorage).loadTransactions.mockReturnValue([]);
    vi.mocked(RecurringTransactionStorage).loadRecurringTransactions.mockReturnValue([]);
    vi.mocked(ScenarioStorage.loadScenarios).mockReturnValue([
      { id: "scenario-1", name: "Base Plan" },
    ]);
    vi.mocked(ScenarioStorage.loadActiveScenarioId).mockReturnValue(null);
  });

  it("renders icon-only trigger button", () => {
    render(
      <Wrapper>
        <DuplicateScenarioDialog scenarioId="scenario-1" />
      </Wrapper>
    );

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button.className).toContain("h-6");
    expect(button.className).toContain("w-6");
  });

  it("opens dialog with name input pre-filled from scenarioId prop", async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <DuplicateScenarioDialog scenarioId="scenario-1" />
      </Wrapper>
    );

    await user.click(screen.getByRole("button"));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /duplicate scenario/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toHaveValue("Base Plan (Copy)");
  });

  it("creates new scenario on submit", async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <DuplicateScenarioDialog scenarioId="scenario-1" />
      </Wrapper>
    );

    await user.click(screen.getByRole("button"));
    await user.clear(screen.getByLabelText(/name/i));
    await user.type(screen.getByLabelText(/name/i), "Optimistic Plan");
    await user.click(screen.getByRole("button", { name: /duplicate$/i }));

    expect(ScenarioStorage.saveScenarios).toHaveBeenCalled();
    const calls = vi.mocked(ScenarioStorage.saveScenarios).mock.calls;
    const lastCall = calls[calls.length - 1][0];
    expect(lastCall).toContainEqual(
      expect.objectContaining({ name: "Optimistic Plan" })
    );
  });

  it("calls onDuplicate callback with new scenario id", async () => {
    const onDuplicate = vi.fn();
    const user = userEvent.setup();
    render(
      <Wrapper>
        <DuplicateScenarioDialog scenarioId="scenario-1" onDuplicate={onDuplicate} />
      </Wrapper>
    );

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("button", { name: /duplicate$/i }));

    expect(onDuplicate).toHaveBeenCalledWith(expect.any(String));
    expect(onDuplicate.mock.calls[0][0]).not.toBe("scenario-1");
  });

  it("copies transactions with source scenarioId to new scenario", async () => {
    const sourceTransactions: Transaction[] = [
      {
        id: "txn-1",
        accountId: "acc-1",
        amount: 100,
        date: "2026-01-01",
        description: "Test Transaction 1",
        scenarioId: "scenario-1",
      },
      {
        id: "txn-2",
        accountId: "acc-2",
        amount: 200,
        date: "2026-01-02",
        description: "Test Transaction 2",
        scenarioId: "scenario-1",
      },
      {
        id: "txn-3",
        accountId: "acc-3",
        amount: 300,
        date: "2026-01-03",
        description: "Test Transaction 3",
        scenarioId: "other-scenario",
      },
    ];

    vi.mocked(TransactionStorage).loadTransactions.mockReturnValue(
      sourceTransactions
    );

    const user = userEvent.setup();
    render(
      <Wrapper>
        <DuplicateScenarioDialog scenarioId="scenario-1" />
      </Wrapper>
    );

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("button", { name: /duplicate$/i }));

    expect(TransactionStorage.saveTransactions).toHaveBeenCalled();
    const calls = vi.mocked(TransactionStorage).saveTransactions.mock.calls;
    const lastCall = calls[calls.length - 1][0];

    // Should have original 3 + 2 copied (txn-3 should not be copied)
    expect(lastCall).toHaveLength(5);

    // Verify copied transactions have new IDs and scenarioId
    const copiedTransactions = lastCall.filter(
      (t) => t.scenarioId !== "scenario-1" && t.scenarioId !== "other-scenario"
    );
    expect(copiedTransactions).toHaveLength(2);
    expect(copiedTransactions[0]).toMatchObject({
      accountId: "acc-1",
      amount: 100,
      date: "2026-01-01",
      description: "Test Transaction 1",
    });
    expect(copiedTransactions[0].id).not.toBe("txn-1");
    expect(copiedTransactions[1]).toMatchObject({
      accountId: "acc-2",
      amount: 200,
      date: "2026-01-02",
      description: "Test Transaction 2",
    });
    expect(copiedTransactions[1].id).not.toBe("txn-2");
  });

  it("copies recurring transactions with source scenarioId to new scenario", async () => {
    const sourceRecurringTransactions: RecurringTransaction[] = [
      {
        id: "rt-1",
        accountId: "acc-1",
        amount: 1000,
        description: "Monthly Salary",
        frequency: "monthly",
        startDate: "2026-01-01",
        scenarioId: "scenario-1",
      },
      {
        id: "rt-2",
        accountId: "acc-2",
        amount: -500,
        description: "Weekly Expense",
        frequency: "weekly",
        startDate: "2026-01-01",
        scenarioId: "scenario-1",
      },
      {
        id: "rt-3",
        accountId: "acc-3",
        amount: 2000,
        description: "Other Scenario Transaction",
        frequency: "monthly",
        startDate: "2026-01-01",
        scenarioId: "other-scenario",
      },
    ];

    vi.mocked(
      RecurringTransactionStorage
    ).loadRecurringTransactions.mockReturnValue(sourceRecurringTransactions);

    const user = userEvent.setup();
    render(
      <Wrapper>
        <DuplicateScenarioDialog scenarioId="scenario-1" />
      </Wrapper>
    );

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("button", { name: /duplicate$/i }));

    expect(
      RecurringTransactionStorage.saveRecurringTransactions
    ).toHaveBeenCalled();
    const calls = vi.mocked(
      RecurringTransactionStorage
    ).saveRecurringTransactions.mock.calls;
    const lastCall = calls[calls.length - 1][0];

    // Should have original 3 + 2 copied (rt-3 should not be copied)
    expect(lastCall).toHaveLength(5);

    // Verify copied recurring transactions have new IDs and scenarioId
    const copiedRecurringTransactions = lastCall.filter(
      (rt) =>
        rt.scenarioId !== "scenario-1" && rt.scenarioId !== "other-scenario"
    );
    expect(copiedRecurringTransactions).toHaveLength(2);
    expect(copiedRecurringTransactions[0]).toMatchObject({
      accountId: "acc-1",
      amount: 1000,
      description: "Monthly Salary",
      frequency: "monthly",
      startDate: "2026-01-01",
    });
    expect(copiedRecurringTransactions[0].id).not.toBe("rt-1");
    expect(copiedRecurringTransactions[1]).toMatchObject({
      accountId: "acc-2",
      amount: -500,
      description: "Weekly Expense",
      frequency: "weekly",
      startDate: "2026-01-01",
    });
    expect(copiedRecurringTransactions[1].id).not.toBe("rt-2");
  });

  it("does not call setActiveScenario after duplication", async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <DuplicateScenarioDialog scenarioId="scenario-1" />
      </Wrapper>
    );

    // Clear calls from initialization
    vi.mocked(ScenarioStorage.saveActiveScenarioId).mockClear();

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("button", { name: /duplicate$/i }));

    // Should not save active scenario ID (planning page manages selection)
    expect(ScenarioStorage.saveActiveScenarioId).not.toHaveBeenCalled();
  });

  it("closes dialog after successful submit", async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <DuplicateScenarioDialog scenarioId="scenario-1" />
      </Wrapper>
    );

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("button", { name: /duplicate$/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("disables submit when name is empty", async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <DuplicateScenarioDialog scenarioId="scenario-1" />
      </Wrapper>
    );

    await user.click(screen.getByRole("button"));
    await user.clear(screen.getByLabelText(/name/i));

    expect(screen.getByRole("button", { name: /duplicate$/i })).toBeDisabled();
  });

  it("trims whitespace from scenario name", async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <DuplicateScenarioDialog scenarioId="scenario-1" />
      </Wrapper>
    );

    await user.click(screen.getByRole("button"));
    await user.clear(screen.getByLabelText(/name/i));
    await user.type(screen.getByLabelText(/name/i), "  Padded Name  ");
    await user.click(screen.getByRole("button", { name: /duplicate$/i }));

    expect(ScenarioStorage.saveScenarios).toHaveBeenCalled();
    const calls = vi.mocked(ScenarioStorage.saveScenarios).mock.calls;
    const lastCall = calls[calls.length - 1][0];
    expect(lastCall).toContainEqual(
      expect.objectContaining({ name: "Padded Name" })
    );
  });

  it("resets form when dialog is reopened", async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <DuplicateScenarioDialog scenarioId="scenario-1" />
      </Wrapper>
    );

    // First open
    await user.click(screen.getByRole("button"));
    const input = screen.getByLabelText(/name/i);
    await user.clear(input);
    await user.type(input, "Modified Name");
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    // Second open should be reset to default
    await user.click(screen.getByRole("button"));
    expect(screen.getByLabelText(/name/i)).toHaveValue("Base Plan (Copy)");
  });

  it("does not copy transactions without scenarioId", async () => {
    const sourceTransactions: Transaction[] = [
      {
        id: "txn-1",
        accountId: "acc-1",
        amount: 100,
        date: "2026-01-01",
        description: "Transaction with scenario",
        scenarioId: "scenario-1",
      },
      {
        id: "txn-2",
        accountId: "acc-2",
        amount: 200,
        date: "2026-01-02",
        description: "Transaction without scenario",
      },
    ];

    vi.mocked(TransactionStorage).loadTransactions.mockReturnValue(
      sourceTransactions
    );

    const user = userEvent.setup();
    render(
      <Wrapper>
        <DuplicateScenarioDialog scenarioId="scenario-1" />
      </Wrapper>
    );

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("button", { name: /duplicate$/i }));

    expect(TransactionStorage.saveTransactions).toHaveBeenCalled();
    const calls = vi.mocked(TransactionStorage).saveTransactions.mock.calls;
    const lastCall = calls[calls.length - 1][0];

    // Should have original 2 + 1 copied (txn-2 should not be copied)
    expect(lastCall).toHaveLength(3);

    // Verify only txn-1 was copied
    const copiedTransactions = lastCall.filter(
      (t) => t.scenarioId !== "scenario-1" && t.scenarioId !== undefined
    );
    expect(copiedTransactions).toHaveLength(1);
    expect(copiedTransactions[0]).toMatchObject({
      accountId: "acc-1",
      amount: 100,
      date: "2026-01-01",
      description: "Transaction with scenario",
    });
  });

  it("does not copy recurring transactions without scenarioId", async () => {
    const sourceRecurringTransactions: RecurringTransaction[] = [
      {
        id: "rt-1",
        accountId: "acc-1",
        amount: 1000,
        description: "With scenario",
        frequency: "monthly",
        startDate: "2026-01-01",
        scenarioId: "scenario-1",
      },
      {
        id: "rt-2",
        accountId: "acc-2",
        amount: -500,
        description: "Without scenario",
        frequency: "weekly",
        startDate: "2026-01-01",
      },
    ];

    vi.mocked(
      RecurringTransactionStorage
    ).loadRecurringTransactions.mockReturnValue(sourceRecurringTransactions);

    const user = userEvent.setup();
    render(
      <Wrapper>
        <DuplicateScenarioDialog scenarioId="scenario-1" />
      </Wrapper>
    );

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("button", { name: /duplicate$/i }));

    expect(
      RecurringTransactionStorage.saveRecurringTransactions
    ).toHaveBeenCalled();
    const calls = vi.mocked(
      RecurringTransactionStorage
    ).saveRecurringTransactions.mock.calls;
    const lastCall = calls[calls.length - 1][0];

    // Should have original 2 + 1 copied (rt-2 should not be copied)
    expect(lastCall).toHaveLength(3);

    // Verify only rt-1 was copied
    const copiedRecurringTransactions = lastCall.filter(
      (rt) => rt.scenarioId !== "scenario-1" && rt.scenarioId !== undefined
    );
    expect(copiedRecurringTransactions).toHaveLength(1);
    expect(copiedRecurringTransactions[0]).toMatchObject({
      accountId: "acc-1",
      amount: 1000,
      description: "With scenario",
      frequency: "monthly",
      startDate: "2026-01-01",
    });
  });

  it("does not pre-fill name when scenario is not found", async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <DuplicateScenarioDialog scenarioId="non-existent-scenario" />
      </Wrapper>
    );

    await user.click(screen.getByRole("button"));

    expect(screen.getByLabelText(/name/i)).toHaveValue("");
  });

  it("does not submit when form is submitted with whitespace-only name", async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <DuplicateScenarioDialog scenarioId="scenario-1" />
      </Wrapper>
    );

    const initialCallCount = vi.mocked(ScenarioStorage.saveScenarios).mock.calls.length;

    await user.click(screen.getByRole("button"));

    const input = screen.getByLabelText(/name/i);
    await user.clear(input);

    Object.defineProperty(input, "value", { value: "   ", writable: true });

    const form = screen.getByRole("dialog").querySelector("form");
    expect(form).toBeInTheDocument();

    form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    expect(vi.mocked(ScenarioStorage.saveScenarios).mock.calls.length).toBe(initialCallCount);
  });

  it("stops propagation on trigger click", async () => {
    const parentClickHandler = vi.fn();
    const user = userEvent.setup();

    render(
      <div onClick={parentClickHandler}>
        <Wrapper>
          <DuplicateScenarioDialog scenarioId="scenario-1" />
        </Wrapper>
      </div>
    );

    await user.click(screen.getByRole("button"));

    // Should not propagate to parent (Popover)
    expect(parentClickHandler).not.toHaveBeenCalled();
  });
});

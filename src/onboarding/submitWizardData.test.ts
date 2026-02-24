import { describe, expect, it, vi } from "vitest";

import { AccountType } from "@/accounts/AccountType";

import { submitWizardData } from "./submitWizardData";
import type { WizardData } from "./WizardData.type";

function createMockDeps() {
  return {
    addAccount: vi.fn(),
    addTransaction: vi.fn(),
    addRecurringTransaction: vi.fn(),
    addGoal: vi.fn(),
    markSetupCompleted: vi.fn(),
    generateId: vi.fn(() => "generated-id"),
  };
}

describe("submitWizardData", () => {
  it("creates accounts from wizard data", async () => {
    const deps = createMockDeps();
    deps.generateId
      .mockReturnValueOnce("acc-1");

    const data: WizardData = {
      accounts: [
        { tempId: "t1", name: "Checking", type: AccountType.Asset, balance: 1000 },
      ],
      recurringEntries: [],
      goal: null,
    };

    await submitWizardData(data, deps);

    expect(deps.addAccount).toHaveBeenCalledWith({
      id: "acc-1",
      name: "Checking",
      type: AccountType.Asset,
    });
  });

  it("creates opening balance transactions for non-zero balances", async () => {
    const deps = createMockDeps();
    deps.generateId
      .mockReturnValueOnce("acc-1")
      .mockReturnValueOnce("tx-1");

    const data: WizardData = {
      accounts: [
        { tempId: "t1", name: "Checking", type: AccountType.Asset, balance: 5000 },
      ],
      recurringEntries: [],
      goal: null,
    };

    await submitWizardData(data, deps);

    expect(deps.addTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "tx-1",
        accountId: "acc-1",
        amount: 5000,
        description: "Opening balance",
      }),
    );
  });

  it("skips opening balance transaction for zero balance", async () => {
    const deps = createMockDeps();
    deps.generateId.mockReturnValueOnce("acc-1");

    const data: WizardData = {
      accounts: [
        { tempId: "t1", name: "Checking", type: AccountType.Asset, balance: 0 },
      ],
      recurringEntries: [],
      goal: null,
    };

    await submitWizardData(data, deps);

    expect(deps.addTransaction).not.toHaveBeenCalled();
  });

  it("maps tempId to real account ID for recurring transactions", async () => {
    const deps = createMockDeps();
    deps.generateId
      .mockReturnValueOnce("acc-1")
      .mockReturnValueOnce("rt-1");

    const data: WizardData = {
      accounts: [
        { tempId: "t1", name: "Checking", type: AccountType.Asset, balance: 0 },
      ],
      recurringEntries: [
        { tempId: "r1", description: "Salary", amount: 5000, accountTempId: "t1" },
      ],
      goal: null,
    };

    await submitWizardData(data, deps);

    expect(deps.addRecurringTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "rt-1",
        accountId: "acc-1",
        description: "Salary",
        amount: 5000,
        frequency: "Monthly",
      }),
    );
  });

  it("skips recurring entries with unmapped account", async () => {
    const deps = createMockDeps();

    const data: WizardData = {
      accounts: [],
      recurringEntries: [
        { tempId: "r1", description: "Salary", amount: 5000, accountTempId: "nonexistent" },
      ],
      goal: null,
    };

    await submitWizardData(data, deps);

    expect(deps.addRecurringTransaction).not.toHaveBeenCalled();
  });

  it("creates a goal when provided", async () => {
    const deps = createMockDeps();
    deps.generateId.mockReturnValueOnce("goal-1");

    const data: WizardData = {
      accounts: [],
      recurringEntries: [],
      goal: { name: "Retirement", targetAmount: 1000000 },
    };

    await submitWizardData(data, deps);

    expect(deps.addGoal).toHaveBeenCalledWith({
      id: "goal-1",
      name: "Retirement",
      targetAmount: 1000000,
    });
  });

  it("does not create goal when null", async () => {
    const deps = createMockDeps();

    const data: WizardData = {
      accounts: [],
      recurringEntries: [],
      goal: null,
    };

    await submitWizardData(data, deps);

    expect(deps.addGoal).not.toHaveBeenCalled();
  });

  it("marks setup as completed", async () => {
    const deps = createMockDeps();

    const data: WizardData = {
      accounts: [],
      recurringEntries: [],
      goal: null,
    };

    await submitWizardData(data, deps);

    expect(deps.markSetupCompleted).toHaveBeenCalled();
  });

  it("sets expectedReturnRate on accounts that have one", async () => {
    const deps = createMockDeps();
    deps.generateId.mockReturnValueOnce("acc-1");

    const data: WizardData = {
      accounts: [
        { tempId: "t1", name: "401k", type: AccountType.Asset, balance: 0, expectedReturnRate: 7 },
      ],
      recurringEntries: [],
      goal: null,
    };

    await submitWizardData(data, deps);

    expect(deps.addAccount).toHaveBeenCalledWith(
      expect.objectContaining({ expectedReturnRate: 7 }),
    );
  });

  it("handles multiple accounts and recurring entries", async () => {
    const deps = createMockDeps();
    deps.generateId
      .mockReturnValueOnce("acc-1")
      .mockReturnValueOnce("tx-1")
      .mockReturnValueOnce("acc-2")
      .mockReturnValueOnce("rt-1")
      .mockReturnValueOnce("rt-2");

    const data: WizardData = {
      accounts: [
        { tempId: "t1", name: "Checking", type: AccountType.Asset, balance: 1000 },
        { tempId: "t2", name: "Credit Card", type: AccountType.Liability, balance: 0 },
      ],
      recurringEntries: [
        { tempId: "r1", description: "Salary", amount: 5000, accountTempId: "t1" },
        { tempId: "r2", description: "Payment", amount: -200, accountTempId: "t2" },
      ],
      goal: null,
    };

    await submitWizardData(data, deps);

    expect(deps.addAccount).toHaveBeenCalledTimes(2);
    expect(deps.addTransaction).toHaveBeenCalledTimes(1);
    expect(deps.addRecurringTransaction).toHaveBeenCalledTimes(2);
    expect(deps.addRecurringTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ accountId: "acc-1" }),
    );
    expect(deps.addRecurringTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ accountId: "acc-2" }),
    );
  });
});

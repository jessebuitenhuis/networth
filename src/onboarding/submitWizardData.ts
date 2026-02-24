import type { Account } from "@/accounts/Account.type";
import type { Goal } from "@/goals/Goal.type";
import { RecurrenceFrequency } from "@/recurring-transactions/RecurrenceFrequency";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import type { Transaction } from "@/transactions/Transaction.type";

import type { WizardData } from "./WizardData.type";

type SubmitDeps = {
  addAccount: (account: Account) => Promise<void>;
  addTransaction: (tx: Transaction) => Promise<void>;
  addRecurringTransaction: (rt: RecurringTransaction) => Promise<void>;
  addGoal: (goal: Goal) => Promise<void>;
  markSetupCompleted: () => Promise<void>;
  generateId: () => string;
};

export async function submitWizardData(data: WizardData, deps: SubmitDeps) {
  const tempIdToRealId = new Map<string, string>();
  const today = new Date().toISOString().split("T")[0];

  for (const entry of data.accounts) {
    const accountId = deps.generateId();
    tempIdToRealId.set(entry.tempId, accountId);

    await deps.addAccount({
      id: accountId,
      name: entry.name,
      type: entry.type,
      expectedReturnRate: entry.expectedReturnRate,
    });

    if (entry.balance !== 0) {
      await deps.addTransaction({
        id: deps.generateId(),
        accountId,
        amount: entry.balance,
        date: today,
        description: "Opening balance",
      });
    }
  }

  for (const entry of data.recurringEntries) {
    const accountId = tempIdToRealId.get(entry.accountTempId);
    if (!accountId) continue;

    await deps.addRecurringTransaction({
      id: deps.generateId(),
      accountId,
      amount: entry.amount,
      description: entry.description,
      frequency: RecurrenceFrequency.Monthly,
      startDate: today,
    });
  }

  if (data.goal) {
    await deps.addGoal({
      id: deps.generateId(),
      name: data.goal.name,
      targetAmount: data.goal.targetAmount,
    });
  }

  await deps.markSetupCompleted();
}

import { getNextOccurrence } from "@/recurring-transactions/getNextOccurrence";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import type { Scenario } from "@/scenarios/Scenario.type";
import type { DisplayTransaction } from "@/transactions/DisplayTransaction.type";
import type { Transaction } from "@/transactions/Transaction.type";

import { filterTransactionsByScenario } from "./filterTransactionsByScenario";
import { isTransactionProjected } from "./isTransactionProjected";

export type DisplayTransactionData = Omit<DisplayTransaction, "editAction"> & {
  sourceTransaction?: Transaction;
  sourceRecurringTransaction?: RecurringTransaction;
};

export function buildDisplayTransactions(
  transactions: Transaction[],
  recurringTransactions: RecurringTransaction[],
  accountId: string,
  accountName: string,
  activeScenarioId: string | null,
  scenarios: Scenario[],
  today: string
): DisplayTransactionData[] {
  const regularItems: DisplayTransactionData[] = filterTransactionsByScenario(
    transactions.filter((t) => t.accountId === accountId),
    activeScenarioId
  ).map((tx) => ({
    id: tx.id,
    accountId,
    description: tx.description,
    accountName,
    date: tx.date,
    amount: tx.amount,
    isProjected: isTransactionProjected(tx, today),
    isRecurring: false,
    scenarioName: tx.scenarioId
      ? scenarios.find((s) => s.id === tx.scenarioId)?.name
      : undefined,
    sourceTransaction: tx,
  }));

  const recurringItems: DisplayTransactionData[] = filterTransactionsByScenario(
    recurringTransactions.filter((rt) => rt.accountId === accountId),
    activeScenarioId
  )
    .map((rt) => {
      const next = getNextOccurrence(rt, today);
      if (!next) return null;
      const item: DisplayTransactionData = {
        id: next.id,
        accountId,
        description: next.description,
        accountName,
        date: next.date,
        amount: next.amount,
        isProjected: true,
        isRecurring: true,
        scenarioName: rt.scenarioId
          ? scenarios.find((s) => s.id === rt.scenarioId)?.name
          : undefined,
        sourceRecurringTransaction: rt,
      };
      return item;
    })
    .filter((item): item is DisplayTransactionData => item !== null);

  return [...regularItems, ...recurringItems].sort(
    (a, b) => b.date.localeCompare(a.date)
  );
}

"use client";

import { useTransactions } from "@/context/TransactionContext";
import { useRecurringTransactions } from "@/context/RecurringTransactionContext";
import { useScenarios } from "@/context/ScenarioContext";
import { useAccounts } from "@/context/AccountContext";
import { getNextOccurrence } from "@/services/getNextOccurrence";
import { formatDate } from "@/lib/dateUtils";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { EditTransactionDialog } from "@/components/transactions/EditTransactionDialog";
import { EditRecurringTransactionDialog } from "@/components/transactions/EditRecurringTransactionDialog";
import type { DisplayTransaction } from "@/models/DisplayTransaction.type";

export function ScenarioTransactionList() {
  const { transactions } = useTransactions();
  const { recurringTransactions } = useRecurringTransactions();
  const { activeScenarioId } = useScenarios();
  const { accounts } = useAccounts();

  const today = formatDate(new Date());

  // Filter logic:
  // - If activeScenarioId is null (baseline only): show only transactions with no scenarioId
  // - If activeScenarioId is set: show baseline (no scenarioId) + matching scenario transactions
  const transactionItems: DisplayTransaction[] = transactions
    .filter((t) => {
      if (activeScenarioId === null) {
        return !t.scenarioId;
      }
      return !t.scenarioId || t.scenarioId === activeScenarioId;
    })
    .map((tx) => {
      const account = accounts.find((a) => a.id === tx.accountId);
      const accountName = account?.name || "Unknown";
      return {
        id: tx.id,
        description: tx.description,
        accountName,
        date: tx.date,
        amount: tx.amount,
        isProjected: tx.isProjected || false,
        isRecurring: false,
        editAction: <EditTransactionDialog transaction={tx} />,
      };
    });

  const recurringItems = recurringTransactions
    .filter((rt) => {
      if (activeScenarioId === null) {
        return !rt.scenarioId;
      }
      return !rt.scenarioId || rt.scenarioId === activeScenarioId;
    })
    .map((rt) => {
      const next = getNextOccurrence(rt, today);
      if (!next) return null;
      const account = accounts.find((a) => a.id === rt.accountId);
      const accountName = account?.name || "Unknown";
      const item: DisplayTransaction = {
        id: next.id,
        description: next.description,
        accountName,
        date: next.date,
        amount: next.amount,
        isProjected: true,
        isRecurring: true,
        editAction: <EditRecurringTransactionDialog recurringTransaction={rt} />,
      };
      return item;
    })
    .filter((item): item is DisplayTransaction => item !== null);

  const allItems = [...transactionItems, ...recurringItems].sort(
    (a, b) => b.date.localeCompare(a.date)
  );

  if (allItems.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No transactions in this scenario yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Scenario Transactions</h3>
      <TransactionTable items={allItems} />
    </div>
  );
}

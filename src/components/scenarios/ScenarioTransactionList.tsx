"use client";

import { useAccounts } from "@/accounts/AccountContext";
import { EditRecurringTransactionDialog } from "@/components/transactions/EditRecurringTransactionDialog";
import { EditTransactionDialog } from "@/components/transactions/EditTransactionDialog";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { formatDate } from "@/lib/dateUtils";
import type { DisplayTransaction } from "@/models/DisplayTransaction.type";
import { useRecurringTransactions } from "@/recurring-transactions/RecurringTransactionContext";
import { useScenarios } from "@/scenarios/ScenarioContext";
import { getNextOccurrence } from "@/services/getNextOccurrence";
import { useTransactions } from "@/transactions/TransactionContext";

type ScenarioTransactionListProps = {
  selectedScenarioIds: Set<string>;
};

export function ScenarioTransactionList({ selectedScenarioIds }: ScenarioTransactionListProps) {
  const { transactions } = useTransactions();
  const { recurringTransactions } = useRecurringTransactions();
  const { scenarios } = useScenarios();
  const { accounts } = useAccounts();

  const today = formatDate(new Date());

  // Filter logic:
  // - If selectedScenarioIds is empty: show only baseline transactions (no scenarioId)
  // - Otherwise: show baseline + union of all selected scenario transactions
  const transactionItems: DisplayTransaction[] = transactions
    .filter((t) => {
      if (selectedScenarioIds.size === 0) {
        return !t.scenarioId;
      }
      return !t.scenarioId || (t.scenarioId && selectedScenarioIds.has(t.scenarioId));
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
        scenarioName: tx.scenarioId ? scenarios.find(s => s.id === tx.scenarioId)?.name : undefined,
        editAction: <EditTransactionDialog transaction={tx} />,
      };
    });

  const recurringItems = recurringTransactions
    .filter((rt) => {
      if (selectedScenarioIds.size === 0) {
        return !rt.scenarioId;
      }
      return !rt.scenarioId || (rt.scenarioId && selectedScenarioIds.has(rt.scenarioId));
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
        scenarioName: rt.scenarioId ? scenarios.find(s => s.id === rt.scenarioId)?.name : undefined,
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
        No transactions yet.
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

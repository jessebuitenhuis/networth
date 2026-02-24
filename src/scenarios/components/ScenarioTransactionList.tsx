"use client";

import { useAccounts } from "@/accounts/AccountContext";
import { useCategories } from "@/categories/CategoryContext";
import { getCategoryPath } from "@/categories/getCategoryPath";
import { formatDate } from "@/lib/dateUtils";
import { getNextOccurrence } from "@/recurring-transactions/getNextOccurrence";
import { useRecurringTransactions } from "@/recurring-transactions/RecurringTransactionContext";
import { useScenarios } from "@/scenarios/ScenarioContext";
import { EditRecurringTransactionDialog } from "@/transactions/components/EditRecurringTransactionDialog";
import { EditTransactionDialog } from "@/transactions/components/EditTransactionDialog";
import { TransactionTable } from "@/transactions/components/TransactionTable";
import type { DisplayTransaction } from "@/transactions/DisplayTransaction.type";
import { useTransactions } from "@/transactions/TransactionContext";

type ScenarioTransactionListProps = {
  selectedScenarioIds: Set<string>;
};

export function ScenarioTransactionList({ selectedScenarioIds }: ScenarioTransactionListProps) {
  const { transactions, updateTransaction, removeTransaction } = useTransactions();
  const { recurringTransactions, updateRecurringTransaction, removeRecurringTransaction } =
    useRecurringTransactions();
  const { scenarios, addScenario } = useScenarios();
  const { accounts } = useAccounts();
  const { categories, addCategory } = useCategories();

  const today = formatDate(new Date());

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
        accountId: tx.accountId,
        description: tx.description,
        accountName,
        date: tx.date,
        amount: tx.amount,
        isProjected: tx.isProjected || false,
        isRecurring: false,
        scenarioName: tx.scenarioId ? scenarios.find(s => s.id === tx.scenarioId)?.name : undefined,
        categoryName: tx.categoryId ? getCategoryPath(tx.categoryId, categories) : undefined,
        editAction: (
          <EditTransactionDialog
            transaction={tx}
            scenarios={scenarios}
            categories={categories}
            onSave={updateTransaction}
            onDelete={removeTransaction}
            onCreateScenario={addScenario}
            onCreateCategory={addCategory}
          />
        ),
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
        accountId: rt.accountId,
        description: next.description,
        accountName,
        date: next.date,
        amount: next.amount,
        isProjected: true,
        isRecurring: true,
        scenarioName: rt.scenarioId ? scenarios.find(s => s.id === rt.scenarioId)?.name : undefined,
        categoryName: rt.categoryId ? getCategoryPath(rt.categoryId, categories) : undefined,
        editAction: (
          <EditRecurringTransactionDialog
            recurringTransaction={rt}
            scenarios={scenarios}
            categories={categories}
            onSave={updateRecurringTransaction}
            onDelete={removeRecurringTransaction}
            onCreateScenario={addScenario}
            onCreateCategory={addCategory}
          />
        ),
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
      <h3 className="section-label">Scenario Transactions</h3>
      <TransactionTable items={allItems} />
    </div>
  );
}

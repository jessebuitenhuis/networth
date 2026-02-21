"use client";

import { useAccounts } from "@/accounts/AccountContext";
import { useCategories } from "@/categories/CategoryContext";
import { getCategoryPath } from "@/categories/getCategoryPath";
import { formatDate } from "@/lib/dateUtils";
import { useRecurringTransactions } from "@/recurring-transactions/RecurringTransactionContext";
import { useScenarios } from "@/scenarios/ScenarioContext";
import { buildDisplayTransactions } from "@/transactions/buildDisplayTransactions";
import type { DisplayTransaction } from "@/transactions/DisplayTransaction.type";
import { useTransactions } from "@/transactions/TransactionContext";

import { EditRecurringTransactionDialog } from "./EditRecurringTransactionDialog";
import { EditTransactionDialog } from "./EditTransactionDialog";
import { TransactionTable } from "./TransactionTable";

type TransactionListProps = {
  accountId: string;
};

export function TransactionList({ accountId }: TransactionListProps) {
  const { transactions, updateTransaction, removeTransaction } = useTransactions();
  const { recurringTransactions, updateRecurringTransaction, removeRecurringTransaction } =
    useRecurringTransactions();
  const { accounts } = useAccounts();
  const { scenarios, activeScenarioId, addScenario } = useScenarios();
  const { categories, addCategory } = useCategories();

  const today = formatDate(new Date());
  const account = accounts.find((a) => a.id === accountId);
  const accountName = account?.name || "Unknown";

  const dataItems = buildDisplayTransactions(
    transactions,
    recurringTransactions,
    accountId,
    accountName,
    activeScenarioId,
    scenarios,
    today
  );

  const allItems: DisplayTransaction[] = dataItems.map((item) => {
    const categoryId = item.sourceTransaction?.categoryId || item.sourceRecurringTransaction?.categoryId;
    return {
      ...item,
      categoryName: categoryId ? getCategoryPath(categoryId, categories) : undefined,
      editAction: item.sourceRecurringTransaction ? (
        <EditRecurringTransactionDialog
          recurringTransaction={item.sourceRecurringTransaction}
          scenarios={scenarios}
          categories={categories}
          onSave={updateRecurringTransaction}
          onDelete={removeRecurringTransaction}
          onCreateScenario={addScenario}
          onCreateCategory={addCategory}
        />
      ) : item.sourceTransaction ? (
        <EditTransactionDialog
          transaction={item.sourceTransaction}
          scenarios={scenarios}
          categories={categories}
          onSave={updateTransaction}
          onDelete={removeTransaction}
          onCreateScenario={addScenario}
          onCreateCategory={addCategory}
        />
      ) : null,
    };
  });

  if (allItems.length === 0) {
    return <p className="text-muted-foreground">No transactions yet.</p>;
  }

  return <TransactionTable items={allItems} />;
}

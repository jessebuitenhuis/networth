"use client";

import { useAccounts } from "@/accounts/AccountContext";
import { formatDate } from "@/lib/dateUtils";
import type { DisplayTransaction } from "@/models/DisplayTransaction.type";
import { useRecurringTransactions } from "@/recurring-transactions/RecurringTransactionContext";
import { useScenarios } from "@/scenarios/ScenarioContext";
import { buildDisplayTransactions } from "@/services/buildDisplayTransactions";
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

  const allItems: DisplayTransaction[] = dataItems.map((item) => ({
    ...item,
    editAction: item.sourceRecurringTransaction ? (
      <EditRecurringTransactionDialog
        recurringTransaction={item.sourceRecurringTransaction}
        scenarios={scenarios}
        onSave={updateRecurringTransaction}
        onDelete={removeRecurringTransaction}
        onCreateScenario={addScenario}
      />
    ) : item.sourceTransaction ? (
      <EditTransactionDialog
        transaction={item.sourceTransaction}
        scenarios={scenarios}
        onSave={updateTransaction}
        onDelete={removeTransaction}
        onCreateScenario={addScenario}
      />
    ) : null,
  }));

  if (allItems.length === 0) {
    return <p className="text-muted-foreground">No transactions yet.</p>;
  }

  return <TransactionTable items={allItems} />;
}

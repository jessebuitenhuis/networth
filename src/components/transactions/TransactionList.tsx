"use client";

import { useAccounts } from "@/accounts/AccountContext";
import { useRecurringTransactions } from "@/context/RecurringTransactionContext";
import { useScenarios } from "@/scenarios/ScenarioContext";
import { useTransactions } from "@/context/TransactionContext";
import { formatDate } from "@/lib/dateUtils";
import type { DisplayTransaction } from "@/models/DisplayTransaction.type";
import { buildDisplayTransactions } from "@/services/buildDisplayTransactions";

import { EditRecurringTransactionDialog } from "./EditRecurringTransactionDialog";
import { EditTransactionDialog } from "./EditTransactionDialog";
import { TransactionTable } from "./TransactionTable";

type TransactionListProps = {
  accountId: string;
};

export function TransactionList({ accountId }: TransactionListProps) {
  const { transactions } = useTransactions();
  const { recurringTransactions } = useRecurringTransactions();
  const { accounts } = useAccounts();
  const { scenarios, activeScenarioId } = useScenarios();

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
      />
    ) : item.sourceTransaction ? (
      <EditTransactionDialog transaction={item.sourceTransaction} />
    ) : null,
  }));

  if (allItems.length === 0) {
    return <p className="text-muted-foreground">No transactions yet.</p>;
  }

  return <TransactionTable items={allItems} />;
}

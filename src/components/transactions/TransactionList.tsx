"use client";

import { useTransactions } from "@/context/TransactionContext";
import { useRecurringTransactions } from "@/context/RecurringTransactionContext";
import { useAccounts } from "@/context/AccountContext";
import { useScenarios } from "@/context/ScenarioContext";
import { isTransactionProjected } from "@/services/isTransactionProjected";
import { getNextOccurrence } from "@/services/getNextOccurrence";
import { formatDate } from "@/lib/dateUtils";
import { TransactionTable } from "./TransactionTable";
import { EditTransactionDialog } from "./EditTransactionDialog";
import { EditRecurringTransactionDialog } from "./EditRecurringTransactionDialog";
import type { DisplayTransaction } from "@/models/DisplayTransaction.type";

type TransactionListProps = {
  accountId: string;
};

export function TransactionList({ accountId }: TransactionListProps) {
  const { transactions } = useTransactions();
  const { recurringTransactions } = useRecurringTransactions();
  const { accounts } = useAccounts();
  const { scenarios } = useScenarios();

  const today = formatDate(new Date());
  const account = accounts.find((a) => a.id === accountId);
  const accountName = account?.name || "Unknown";

  const regularItems: DisplayTransaction[] = transactions
    .filter((t) => t.accountId === accountId)
    .map((tx) => ({
      id: tx.id,
      description: tx.description,
      accountName,
      date: tx.date,
      amount: tx.amount,
      isProjected: isTransactionProjected(tx),
      isRecurring: false,
      scenarioName: tx.scenarioId ? scenarios.find(s => s.id === tx.scenarioId)?.name : undefined,
      editAction: <EditTransactionDialog transaction={tx} />,
    }));

  const recurringItems = recurringTransactions
    .filter((rt) => rt.accountId === accountId)
    .map((rt) => {
      const next = getNextOccurrence(rt, today);
      if (!next) return null;
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

  const allItems = [...regularItems, ...recurringItems].sort(
    (a, b) => b.date.localeCompare(a.date)
  );

  if (allItems.length === 0) {
    return <p className="text-muted-foreground">No transactions yet.</p>;
  }

  return <TransactionTable items={allItems} />;
}

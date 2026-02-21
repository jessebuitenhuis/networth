"use client";

import { useMemo, useState } from "react";

import { useAccounts } from "@/accounts/AccountContext";
import { formatDate } from "@/lib/dateUtils";
import { useRecurringTransactions } from "@/recurring-transactions/RecurringTransactionContext";
import { useScenarios } from "@/scenarios/ScenarioContext";
import { buildDisplayTransactions } from "@/transactions/buildDisplayTransactions";
import type { DisplayTransaction } from "@/transactions/DisplayTransaction.type";
import { filterDisplayTransactions } from "@/transactions/filterDisplayTransactions";
import { useTransactions } from "@/transactions/TransactionContext";
import {
  emptyFilters,
  type TransactionFilters,
} from "@/transactions/TransactionFilters.type";

import { EditRecurringTransactionDialog } from "./EditRecurringTransactionDialog";
import { EditTransactionDialog } from "./EditTransactionDialog";
import { TransactionFilterBar } from "./TransactionFilterBar";
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
  const [filters, setFilters] = useState<TransactionFilters>(emptyFilters);

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

  const filteredItems = useMemo(
    () => filterDisplayTransactions(allItems, filters),
    [allItems, filters]
  );

  if (allItems.length === 0) {
    return <p className="text-muted-foreground">No transactions yet.</p>;
  }

  return (
    <div className="space-y-4">
      <TransactionFilterBar
        filters={filters}
        onChange={setFilters}
        resultCount={filteredItems.length}
        totalCount={allItems.length}
      />
      {filteredItems.length === 0 ? (
        <p className="text-muted-foreground">No transactions match the current filters.</p>
      ) : (
        <TransactionTable items={filteredItems} />
      )}
    </div>
  );
}

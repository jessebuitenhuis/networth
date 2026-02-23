"use client";

import { useState } from "react";

import { useAccounts } from "@/accounts/AccountContext";
import { useCategories } from "@/categories/CategoryContext";
import TopBar from "@/components/layout/TopBar";
import { formatDate } from "@/lib/dateUtils";
import { useRecurringTransactions } from "@/recurring-transactions/RecurringTransactionContext";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import { ScenarioFilterSelect } from "@/scenarios/components/ScenarioFilterSelect";
import { useScenarios } from "@/scenarios/ScenarioContext";
import { buildAllDisplayTransactions } from "@/transactions/buildAllDisplayTransactions";
import { CreateTransactionDialog } from "@/transactions/components/CreateTransactionDialog";
import { EditRecurringTransactionDialog } from "@/transactions/components/EditRecurringTransactionDialog";
import { EditTransactionDialog } from "@/transactions/components/EditTransactionDialog";
import { TransactionFilterBar } from "@/transactions/components/TransactionFilterBar";
import { TransactionTable } from "@/transactions/components/TransactionTable";
import { filterDisplayTransactions } from "@/transactions/filterDisplayTransactions";
import type { Transaction } from "@/transactions/Transaction.type";
import { useTransactions } from "@/transactions/TransactionContext";
import { emptyFilters, type TransactionFilters } from "@/transactions/TransactionFilters.type";

export default function TransactionsPage() {
  const { accounts } = useAccounts();
  const { transactions, updateTransaction, removeTransaction } = useTransactions();
  const { recurringTransactions, updateRecurringTransaction, removeRecurringTransaction } =
    useRecurringTransactions();
  const { scenarios, activeScenarioId, setActiveScenario, addScenario } = useScenarios();
  const { categories, addCategory } = useCategories();
  const [filters, setFilters] = useState<TransactionFilters>(emptyFilters);

  const today = formatDate(new Date());

  function editActionForTransaction(tx: Transaction) {
    return (
      <EditTransactionDialog
        transaction={tx}
        scenarios={scenarios}
        categories={categories}
        onSave={updateTransaction}
        onDelete={removeTransaction}
        onCreateScenario={addScenario}
        onCreateCategory={addCategory}
      />
    );
  }

  function editActionForRecurring(rt: RecurringTransaction) {
    return (
      <EditRecurringTransactionDialog
        recurringTransaction={rt}
        scenarios={scenarios}
        categories={categories}
        onSave={updateRecurringTransaction}
        onDelete={removeRecurringTransaction}
        onCreateScenario={addScenario}
        onCreateCategory={addCategory}
      />
    );
  }

  const allItems = buildAllDisplayTransactions({
    transactions,
    recurringTransactions,
    accounts,
    scenarios,
    categories,
    activeScenarioId,
    editActionForTransaction,
    editActionForRecurring,
  });

  const plannedItems = allItems.filter((item) => item.isProjected || item.date > today);
  const actualItems = allItems.filter((item) => !item.isProjected && item.date <= today);

  const filteredActual = filterDisplayTransactions(actualItems, filters);
  const filteredPlanned = filterDisplayTransactions(plannedItems, filters);

  const effectiveScenario = scenarios.find((s) => s.id === activeScenarioId) ?? null;

  return (
    <>
      <TopBar
        title="Transactions"
        actions={
          <>
            <CreateTransactionDialog />
            <ScenarioFilterSelect
              scenarios={scenarios}
              value={effectiveScenario?.id ?? null}
              onValueChange={setActiveScenario}
            />
          </>
        }
      />
      <div className="flex justify-center p-4">
        <div className="w-full max-w-4xl space-y-4">
          {plannedItems.length > 0 && (
            <details className="rounded-lg border">
              <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 list-none">
                <span>Planned ({filteredPlanned.length})</span>
              </summary>
              <div className="p-2">
                <TransactionTable items={filteredPlanned} showAccountColumn />
              </div>
            </details>
          )}

          <TransactionFilterBar
            filters={filters}
            onChange={setFilters}
            resultCount={filteredActual.length}
            totalCount={actualItems.length}
            accounts={accounts}
            categories={categories}
          />

          <TransactionTable items={filteredActual} showAccountColumn />
        </div>
      </div>
    </>
  );
}

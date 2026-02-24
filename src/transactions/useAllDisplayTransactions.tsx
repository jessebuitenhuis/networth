"use client";

import { useMemo } from "react";

import { useAccounts } from "@/accounts/AccountContext";
import { useCategories } from "@/categories/CategoryContext";
import { formatDate } from "@/lib/dateUtils";
import { useRecurringTransactions } from "@/recurring-transactions/RecurringTransactionContext";
import { useScenarios } from "@/scenarios/ScenarioContext";
import { useTransactions } from "@/transactions/TransactionContext";

import { buildAllDisplayTransactions } from "./buildAllDisplayTransactions";
import type { DisplayTransactionData } from "./buildDisplayTransactions";
import { EditRecurringTransactionDialog } from "./components/EditRecurringTransactionDialog";
import { EditTransactionDialog } from "./components/EditTransactionDialog";
import type { DisplayTransaction } from "./DisplayTransaction.type";

export function useAllDisplayTransactions(): DisplayTransaction[] {
  const { transactions, updateTransaction, removeTransaction } = useTransactions();
  const { recurringTransactions, updateRecurringTransaction, removeRecurringTransaction } =
    useRecurringTransactions();
  const { accounts } = useAccounts();
  const { scenarios, activeScenarioId, addScenario } = useScenarios();
  const { categories, addCategory } = useCategories();

  const today = formatDate(new Date());

  const dataItems = useMemo(
    () =>
      buildAllDisplayTransactions(
        transactions,
        recurringTransactions,
        accounts,
        activeScenarioId,
        scenarios,
        categories,
        today
      ),
    [transactions, recurringTransactions, accounts, activeScenarioId, scenarios, categories, today]
  );

  return useMemo(
    () => dataItems.map((item) => toDisplayTransaction(item)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataItems]
  );

  function toDisplayTransaction(item: DisplayTransactionData): DisplayTransaction {
    return {
      ...item,
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
  }
}

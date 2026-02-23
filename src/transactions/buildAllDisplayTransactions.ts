import type { ReactNode } from "react";

import type { Account } from "@/accounts/Account.type";
import type { Category } from "@/categories/Category.type";
import { getCategoryPath } from "@/categories/getCategoryPath";
import { formatDate } from "@/lib/dateUtils";
import { getNextOccurrence } from "@/recurring-transactions/getNextOccurrence";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import type { Scenario } from "@/scenarios/Scenario.type";
import type { DisplayTransaction } from "@/transactions/DisplayTransaction.type";
import { filterTransactionsByScenario } from "@/transactions/filterTransactionsByScenario";
import type { Transaction } from "@/transactions/Transaction.type";

type BuildAllDisplayTransactionsOptions = {
  transactions: Transaction[];
  recurringTransactions: RecurringTransaction[];
  accounts: Account[];
  scenarios: Scenario[];
  categories: Category[];
  activeScenarioId: string | null;
  editActionForTransaction: (tx: Transaction) => ReactNode;
  editActionForRecurring: (rt: RecurringTransaction) => ReactNode;
};

export function buildAllDisplayTransactions({
  transactions,
  recurringTransactions,
  accounts,
  scenarios,
  categories,
  activeScenarioId,
  editActionForTransaction,
  editActionForRecurring,
}: BuildAllDisplayTransactionsOptions): DisplayTransaction[] {
  const today = formatDate(new Date());

  const filteredTransactions = filterTransactionsByScenario(transactions, activeScenarioId);

  const transactionItems: DisplayTransaction[] = filteredTransactions.map((tx) => {
    const account = accounts.find((a) => a.id === tx.accountId);
    return {
      id: tx.id,
      description: tx.description,
      accountName: account?.name ?? "Unknown",
      accountId: tx.accountId,
      date: tx.date,
      amount: tx.amount,
      isProjected: tx.isProjected || false,
      isRecurring: false,
      scenarioName: tx.scenarioId
        ? scenarios.find((s) => s.id === tx.scenarioId)?.name
        : undefined,
      categoryName: tx.categoryId ? getCategoryPath(tx.categoryId, categories) : undefined,
      categoryId: tx.categoryId,
      editAction: editActionForTransaction(tx),
    };
  });

  const filteredRecurring = filterTransactionsByScenario(recurringTransactions, activeScenarioId);

  const recurringItems = filteredRecurring
    .map((rt) => {
      const next = getNextOccurrence(rt, today);
      if (!next) return null;
      const account = accounts.find((a) => a.id === rt.accountId);
      const item: DisplayTransaction = {
        id: next.id,
        description: next.description,
        accountName: account?.name ?? "Unknown",
        accountId: rt.accountId,
        date: next.date,
        amount: next.amount,
        isProjected: true,
        isRecurring: true,
        scenarioName: rt.scenarioId
          ? scenarios.find((s) => s.id === rt.scenarioId)?.name
          : undefined,
        categoryName: rt.categoryId ? getCategoryPath(rt.categoryId, categories) : undefined,
        categoryId: rt.categoryId,
        editAction: editActionForRecurring(rt),
      };
      return item;
    })
    .filter((item): item is DisplayTransaction => item !== null);

  return [...transactionItems, ...recurringItems];
}

import type { Account } from "@/accounts/Account.type";
import type { Category } from "@/categories/Category.type";
import { getCategoryPath } from "@/categories/getCategoryPath";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import type { Scenario } from "@/scenarios/Scenario.type";
import type { Transaction } from "@/transactions/Transaction.type";

import {
  buildDisplayTransactions,
  type DisplayTransactionData,
} from "./buildDisplayTransactions";

export function buildAllDisplayTransactions(
  transactions: Transaction[],
  recurringTransactions: RecurringTransaction[],
  accounts: Account[],
  activeScenarioId: string | null,
  scenarios: Scenario[],
  categories: Category[],
  today: string
): DisplayTransactionData[] {
  const items = accounts.flatMap((account) =>
    buildDisplayTransactions(
      transactions,
      recurringTransactions,
      account.id,
      account.name,
      activeScenarioId,
      scenarios,
      today
    )
  );

  return resolveCategoryPaths(items, categories).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}

function resolveCategoryPaths(
  items: DisplayTransactionData[],
  categories: Category[]
): DisplayTransactionData[] {
  return items.map((item) => {
    const categoryId =
      item.sourceTransaction?.categoryId ??
      item.sourceRecurringTransaction?.categoryId;
    if (!categoryId) return item;
    return { ...item, categoryId, categoryName: getCategoryPath(categoryId, categories) };
  });
}

import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import type { Transaction } from "@/transactions/Transaction.type";

import { createProjectedTransaction } from "./createProjectedTransaction";
import { iterateOccurrenceDates } from "./iterateOccurrenceDates";

export function getNextOccurrence(
  recurring: RecurringTransaction,
  onOrAfter: string
): Transaction | null {
  for (const dateStr of iterateOccurrenceDates(recurring)) {
    if (dateStr >= onOrAfter) {
      return createProjectedTransaction(recurring, dateStr);
    }
  }

  return null;
}

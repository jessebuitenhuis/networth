import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import type { Transaction } from "@/transactions/Transaction.type";

import { createProjectedTransaction } from "./createProjectedTransaction";
import { iterateOccurrenceDates } from "./iterateOccurrenceDates";

export function generateOccurrences(
  recurring: RecurringTransaction,
  rangeStart: string,
  rangeEnd: string
): Transaction[] {
  const results: Transaction[] = [];

  for (const dateStr of iterateOccurrenceDates(recurring)) {
    if (dateStr > rangeEnd) break;
    if (dateStr >= rangeStart) {
      results.push(createProjectedTransaction(recurring, dateStr));
    }
  }

  return results;
}

import { addMonths, addYears, formatDate } from "@/lib/dateUtils";
import { RecurrenceFrequency } from "@/models/RecurrenceFrequency";
import type { RecurringTransaction } from "@/models/RecurringTransaction.type";
import type { Transaction } from "@/models/Transaction.type";

export function generateOccurrences(
  recurring: RecurringTransaction,
  rangeStart: string,
  rangeEnd: string
): Transaction[] {
  const results: Transaction[] = [];
  const start = new Date(recurring.startDate + "T00:00:00");
  let step = 0;

  while (true) {
    const date =
      recurring.frequency === RecurrenceFrequency.Monthly
        ? addMonths(start, step)
        : addYears(start, step);
    const dateStr = formatDate(date);

    if (dateStr > rangeEnd) break;
    if (recurring.endDate && dateStr >= recurring.endDate) break;

    if (dateStr >= rangeStart) {
      results.push({
        id: `${recurring.id}-${dateStr}`,
        accountId: recurring.accountId,
        amount: recurring.amount,
        date: dateStr,
        description: recurring.description,
        isProjected: true,
      });
    }

    step++;
  }

  return results;
}

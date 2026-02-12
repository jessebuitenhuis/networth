import type { RecurringTransaction } from "@/models/RecurringTransaction.type";
import { RecurrenceFrequency } from "@/models/RecurrenceFrequency.type";
import type { Transaction } from "@/models/Transaction.type";
import { addMonths, addYears, formatDate } from "@/lib/dateUtils";

export function getNextOccurrence(
  recurring: RecurringTransaction,
  onOrAfter: string
): Transaction | null {
  const start = new Date(recurring.startDate + "T00:00:00");
  let step = 0;

  while (true) {
    const date =
      recurring.frequency === RecurrenceFrequency.Monthly
        ? addMonths(start, step)
        : addYears(start, step);
    const dateStr = formatDate(date);

    if (recurring.endDate && dateStr >= recurring.endDate) return null;

    if (dateStr >= onOrAfter) {
      return {
        id: `${recurring.id}-${dateStr}`,
        accountId: recurring.accountId,
        amount: recurring.amount,
        date: dateStr,
        description: recurring.description,
        isProjected: true,
      };
    }

    step++;
  }
}

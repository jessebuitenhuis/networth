import { addMonths, addYears, formatDate } from "@/lib/dateUtils";
import { RecurrenceFrequency } from "@/models/RecurrenceFrequency";
import type { RecurringTransaction } from "@/models/RecurringTransaction.type";

export function* iterateOccurrenceDates(
  recurring: RecurringTransaction
): Generator<string> {
  const start = new Date(recurring.startDate + "T00:00:00");
  let step = 0;

  while (true) {
    const date =
      recurring.frequency === RecurrenceFrequency.Monthly
        ? addMonths(start, step)
        : addYears(start, step);
    const dateStr = formatDate(date);

    if (recurring.endDate && dateStr >= recurring.endDate) return;

    yield dateStr;
    step++;
  }
}

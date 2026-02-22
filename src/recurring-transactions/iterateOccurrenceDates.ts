import { addMonths, addWeeks, addYears, formatDate } from "@/lib/dateUtils";
import { RecurrenceFrequency } from "@/recurring-transactions/RecurrenceFrequency";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";

const advancers: Record<
  RecurrenceFrequency,
  (start: Date, step: number) => Date
> = {
  [RecurrenceFrequency.Weekly]: (start, step) => addWeeks(start, step),
  [RecurrenceFrequency.BiWeekly]: (start, step) => addWeeks(start, step * 2),
  [RecurrenceFrequency.Monthly]: (start, step) => addMonths(start, step),
  [RecurrenceFrequency.Quarterly]: (start, step) =>
    addMonths(start, step * 3),
  [RecurrenceFrequency.Yearly]: (start, step) => addYears(start, step),
};

export function* iterateOccurrenceDates(
  recurring: RecurringTransaction
): Generator<string> {
  const start = new Date(recurring.startDate + "T00:00:00");
  const advance = advancers[recurring.frequency];
  let step = 0;

  while (true) {
    const date = advance(start, step);
    const dateStr = formatDate(date);

    if (recurring.endDate && dateStr >= recurring.endDate) return;

    yield dateStr;
    step++;
  }
}

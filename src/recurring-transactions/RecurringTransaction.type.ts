import type { RecurrenceFrequency } from "./RecurrenceFrequency";

export type RecurringTransaction = {
  id: string;
  accountId: string;
  amount: number;
  description: string;
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string;
  scenarioId?: string;
  categoryId?: string;
};

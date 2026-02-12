import type { RecurrenceFrequency } from "./RecurrenceFrequency.type";

export type RecurringTransaction = {
  id: string;
  accountId: string;
  amount: number;
  description: string;
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string;
  scenarioId?: string;
};

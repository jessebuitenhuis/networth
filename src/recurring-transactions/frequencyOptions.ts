import { RecurrenceFrequency } from "./RecurrenceFrequency";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export const RECURRENCE_FREQUENCY_OPTIONS: SelectOption<RecurrenceFrequency>[] = [
  { value: RecurrenceFrequency.Weekly, label: "Weekly" },
  { value: RecurrenceFrequency.BiWeekly, label: "Bi-weekly" },
  { value: RecurrenceFrequency.Monthly, label: "Monthly" },
  { value: RecurrenceFrequency.Quarterly, label: "Quarterly" },
  { value: RecurrenceFrequency.Yearly, label: "Yearly" },
];

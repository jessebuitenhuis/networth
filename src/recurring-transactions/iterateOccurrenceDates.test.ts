import { describe, expect, it } from "vitest";

import { RecurrenceFrequency } from "@/recurring-transactions/RecurrenceFrequency";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";

import { iterateOccurrenceDates } from "./iterateOccurrenceDates";

function collectDates(
  recurring: RecurringTransaction,
  limit: number
): string[] {
  const dates: string[] = [];
  for (const date of iterateOccurrenceDates(recurring)) {
    dates.push(date);
    if (dates.length >= limit) break;
  }
  return dates;
}

describe("iterateOccurrenceDates", () => {
  it("yields monthly dates from startDate", () => {
    const recurring: RecurringTransaction = {
      id: "rt-1",
      accountId: "acc-1",
      amount: 100,
      description: "Test",
      frequency: RecurrenceFrequency.Monthly,
      startDate: "2026-01-15",
    };

    const dates = collectDates(recurring, 4);

    expect(dates).toEqual([
      "2026-01-15",
      "2026-02-15",
      "2026-03-15",
      "2026-04-15",
    ]);
  });

  it("yields yearly dates from startDate", () => {
    const recurring: RecurringTransaction = {
      id: "rt-1",
      accountId: "acc-1",
      amount: 100,
      description: "Test",
      frequency: RecurrenceFrequency.Yearly,
      startDate: "2026-06-01",
    };

    const dates = collectDates(recurring, 3);

    expect(dates).toEqual(["2026-06-01", "2027-06-01", "2028-06-01"]);
  });

  it("stops before endDate", () => {
    const recurring: RecurringTransaction = {
      id: "rt-1",
      accountId: "acc-1",
      amount: 100,
      description: "Test",
      frequency: RecurrenceFrequency.Monthly,
      startDate: "2026-01-15",
      endDate: "2026-04-01",
    };

    const dates = collectDates(recurring, 100);

    expect(dates).toEqual(["2026-01-15", "2026-02-15", "2026-03-15"]);
  });

  it("handles end-of-month clamping for monthly", () => {
    const recurring: RecurringTransaction = {
      id: "rt-1",
      accountId: "acc-1",
      amount: 100,
      description: "Test",
      frequency: RecurrenceFrequency.Monthly,
      startDate: "2026-01-31",
    };

    const dates = collectDates(recurring, 3);

    expect(dates).toEqual(["2026-01-31", "2026-02-28", "2026-03-31"]);
  });

  it("yields weekly dates from startDate", () => {
    const recurring: RecurringTransaction = {
      id: "rt-1",
      accountId: "acc-1",
      amount: 50,
      description: "Weekly groceries",
      frequency: RecurrenceFrequency.Weekly,
      startDate: "2026-03-02",
    };

    const dates = collectDates(recurring, 4);

    expect(dates).toEqual([
      "2026-03-02",
      "2026-03-09",
      "2026-03-16",
      "2026-03-23",
    ]);
  });

  it("yields bi-weekly dates from startDate", () => {
    const recurring: RecurringTransaction = {
      id: "rt-1",
      accountId: "acc-1",
      amount: 2000,
      description: "Bi-weekly paycheck",
      frequency: RecurrenceFrequency.BiWeekly,
      startDate: "2026-01-05",
    };

    const dates = collectDates(recurring, 4);

    expect(dates).toEqual([
      "2026-01-05",
      "2026-01-19",
      "2026-02-02",
      "2026-02-16",
    ]);
  });

  it("yields quarterly dates from startDate", () => {
    const recurring: RecurringTransaction = {
      id: "rt-1",
      accountId: "acc-1",
      amount: -500,
      description: "Quarterly tax payment",
      frequency: RecurrenceFrequency.Quarterly,
      startDate: "2026-01-15",
    };

    const dates = collectDates(recurring, 4);

    expect(dates).toEqual([
      "2026-01-15",
      "2026-04-15",
      "2026-07-15",
      "2026-10-15",
    ]);
  });

  it("handles end-of-month clamping for quarterly", () => {
    const recurring: RecurringTransaction = {
      id: "rt-1",
      accountId: "acc-1",
      amount: -500,
      description: "Quarterly payment",
      frequency: RecurrenceFrequency.Quarterly,
      startDate: "2026-01-31",
    };

    const dates = collectDates(recurring, 4);

    expect(dates).toEqual([
      "2026-01-31",
      "2026-04-30",
      "2026-07-31",
      "2026-10-31",
    ]);
  });

  it("stops bi-weekly dates before endDate", () => {
    const recurring: RecurringTransaction = {
      id: "rt-1",
      accountId: "acc-1",
      amount: 2000,
      description: "Bi-weekly paycheck",
      frequency: RecurrenceFrequency.BiWeekly,
      startDate: "2026-01-05",
      endDate: "2026-02-01",
    };

    const dates = collectDates(recurring, 100);

    expect(dates).toEqual(["2026-01-05", "2026-01-19"]);
  });
});

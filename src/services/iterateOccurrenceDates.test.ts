import { describe, expect, it } from "vitest";

import { RecurrenceFrequency } from "@/models/RecurrenceFrequency";
import type { RecurringTransaction } from "@/models/RecurringTransaction.type";

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
});

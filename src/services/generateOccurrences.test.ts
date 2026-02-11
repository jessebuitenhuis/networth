import { describe, expect, it } from "vitest";
import { generateOccurrences } from "./generateOccurrences";
import { RecurrenceFrequency } from "@/models/RecurrenceFrequency";
import type { RecurringTransaction } from "@/models/RecurringTransaction";

function makeRecurring(
  overrides: Partial<RecurringTransaction> = {}
): RecurringTransaction {
  return {
    id: "r1",
    accountId: "a1",
    amount: 5000,
    description: "Salary",
    frequency: RecurrenceFrequency.Monthly,
    startDate: "2024-01-15",
    ...overrides,
  };
}

describe("generateOccurrences", () => {
  it("generates monthly occurrences within date range", () => {
    const rt = makeRecurring({ startDate: "2024-01-15" });
    const result = generateOccurrences(rt, "2024-01-01", "2024-04-30");

    expect(result).toHaveLength(4);
    expect(result.map((t) => t.date)).toEqual([
      "2024-01-15",
      "2024-02-15",
      "2024-03-15",
      "2024-04-15",
    ]);
  });

  it("generates yearly occurrences within date range", () => {
    const rt = makeRecurring({
      frequency: RecurrenceFrequency.Yearly,
      startDate: "2024-06-01",
    });
    const result = generateOccurrences(rt, "2024-01-01", "2027-01-01");

    expect(result).toHaveLength(3);
    expect(result.map((t) => t.date)).toEqual([
      "2024-06-01",
      "2025-06-01",
      "2026-06-01",
    ]);
  });

  it("respects endDate and stops generating", () => {
    const rt = makeRecurring({
      startDate: "2024-01-15",
      endDate: "2024-03-01",
    });
    const result = generateOccurrences(rt, "2024-01-01", "2024-12-31");

    expect(result).toHaveLength(2);
    expect(result.map((t) => t.date)).toEqual(["2024-01-15", "2024-02-15"]);
  });

  it("returns no instances outside range", () => {
    const rt = makeRecurring({ startDate: "2025-01-15" });
    const result = generateOccurrences(rt, "2024-01-01", "2024-12-31");

    expect(result).toHaveLength(0);
  });

  it("clamps month-end dates (Jan 31 -> Feb 28 non-leap)", () => {
    const rt = makeRecurring({ startDate: "2023-01-31" });
    const result = generateOccurrences(rt, "2023-01-01", "2023-03-31");

    expect(result.map((t) => t.date)).toEqual([
      "2023-01-31",
      "2023-02-28",
      "2023-03-31",
    ]);
  });

  it("clamps month-end dates (Jan 31 -> Feb 29 leap year)", () => {
    const rt = makeRecurring({ startDate: "2024-01-31" });
    const result = generateOccurrences(rt, "2024-01-01", "2024-03-31");

    expect(result.map((t) => t.date)).toEqual([
      "2024-01-31",
      "2024-02-29",
      "2024-03-31",
    ]);
  });

  it("handles leap year for yearly recurrence (Feb 29 -> Feb 28)", () => {
    const rt = makeRecurring({
      frequency: RecurrenceFrequency.Yearly,
      startDate: "2024-02-29",
    });
    const result = generateOccurrences(rt, "2024-01-01", "2026-12-31");

    expect(result.map((t) => t.date)).toEqual([
      "2024-02-29",
      "2025-02-28",
      "2026-02-28",
    ]);
  });

  it("generates deterministic IDs based on recurring ID and date", () => {
    const rt = makeRecurring({ id: "r42", startDate: "2024-01-15" });
    const result = generateOccurrences(rt, "2024-01-01", "2024-02-28");

    expect(result[0].id).toBe("r42-2024-01-15");
    expect(result[1].id).toBe("r42-2024-02-15");
  });

  it("sets correct accountId, amount, and description on generated transactions", () => {
    const rt = makeRecurring({
      accountId: "a5",
      amount: -1200,
      description: "Rent",
      startDate: "2024-01-01",
    });
    const result = generateOccurrences(rt, "2024-01-01", "2024-01-31");

    expect(result[0]).toMatchObject({
      accountId: "a5",
      amount: -1200,
      description: "Rent",
    });
  });

  it("skips occurrences before rangeStart but includes later ones", () => {
    const rt = makeRecurring({ startDate: "2024-01-15" });
    const result = generateOccurrences(rt, "2024-03-01", "2024-04-30");

    expect(result).toHaveLength(2);
    expect(result.map((t) => t.date)).toEqual(["2024-03-15", "2024-04-15"]);
  });

  it("marks generated transactions as projected", () => {
    const rt = makeRecurring({ startDate: "2024-01-15" });
    const result = generateOccurrences(rt, "2024-01-01", "2024-02-28");

    result.forEach((t) => expect(t.isProjected).toBe(true));
  });
});

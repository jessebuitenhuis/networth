import { describe, expect, it } from "vitest";
import { getNextOccurrence } from "./getNextOccurrence";
import { RecurrenceFrequency } from "@/models/RecurrenceFrequency.type";
import type { RecurringTransaction } from "@/models/RecurringTransaction.type";

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

describe("getNextOccurrence", () => {
  it("returns the start date when onOrAfter is before start", () => {
    const rt = makeRecurring({ startDate: "2024-06-15" });
    const result = getNextOccurrence(rt, "2024-01-01");

    expect(result).not.toBeNull();
    expect(result!.date).toBe("2024-06-15");
  });

  it("returns the start date when onOrAfter equals start", () => {
    const rt = makeRecurring({ startDate: "2024-01-15" });
    const result = getNextOccurrence(rt, "2024-01-15");

    expect(result).not.toBeNull();
    expect(result!.date).toBe("2024-01-15");
  });

  it("returns the next monthly occurrence after onOrAfter", () => {
    const rt = makeRecurring({ startDate: "2024-01-15" });
    const result = getNextOccurrence(rt, "2024-03-20");

    expect(result).not.toBeNull();
    expect(result!.date).toBe("2024-04-15");
  });

  it("returns the current month if onOrAfter is on the recurrence day", () => {
    const rt = makeRecurring({ startDate: "2024-01-15" });
    const result = getNextOccurrence(rt, "2024-05-15");

    expect(result).not.toBeNull();
    expect(result!.date).toBe("2024-05-15");
  });

  it("returns the next yearly occurrence after onOrAfter", () => {
    const rt = makeRecurring({
      frequency: RecurrenceFrequency.Yearly,
      startDate: "2024-06-01",
    });
    const result = getNextOccurrence(rt, "2025-07-01");

    expect(result).not.toBeNull();
    expect(result!.date).toBe("2026-06-01");
  });

  it("returns null when recurrence has ended", () => {
    const rt = makeRecurring({
      startDate: "2024-01-15",
      endDate: "2024-03-01",
    });
    const result = getNextOccurrence(rt, "2024-04-01");

    expect(result).toBeNull();
  });

  it("returns occurrence just before endDate", () => {
    const rt = makeRecurring({
      startDate: "2024-01-15",
      endDate: "2024-03-20",
    });
    const result = getNextOccurrence(rt, "2024-03-01");

    expect(result).not.toBeNull();
    expect(result!.date).toBe("2024-03-15");
  });

  it("generates deterministic ID", () => {
    const rt = makeRecurring({ id: "r42", startDate: "2024-01-15" });
    const result = getNextOccurrence(rt, "2024-01-01");

    expect(result!.id).toBe("r42-2024-01-15");
  });

  it("marks occurrence as projected", () => {
    const rt = makeRecurring();
    const result = getNextOccurrence(rt, "2024-01-01");

    expect(result!.isProjected).toBe(true);
  });
});

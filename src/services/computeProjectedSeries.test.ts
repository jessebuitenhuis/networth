import { describe, expect, it } from "vitest";
import { computeProjectedSeries } from "./computeProjectedSeries";
import { ProjectionPeriod } from "@/models/ProjectionPeriod";
import { AccountType } from "@/models/AccountType";
import { RecurrenceFrequency } from "@/models/RecurrenceFrequency";
import type { Account } from "@/models/Account";
import type { Transaction } from "@/models/Transaction";
import type { RecurringTransaction } from "@/models/RecurringTransaction";

const TODAY = "2024-06-15";

function makeAccount(id: string, type: AccountType): Account {
  return { id, name: `Account ${id}`, type };
}

function makeTx(
  accountId: string,
  amount: number,
  date: string,
  isProjected?: boolean
): Transaction {
  return {
    id: `t-${accountId}-${date}`,
    accountId,
    amount,
    date,
    description: "",
    isProjected,
  };
}

describe("computeProjectedSeries", () => {
  describe("date range generation", () => {
    it("generates daily points for OneMonth (31 points)", () => {
      const result = computeProjectedSeries([], [], ProjectionPeriod.OneMonth, TODAY);
      expect(result[0].date).toBe(TODAY);
      expect(result).toHaveLength(31);
    });

    it("generates daily points for ThreeMonths (91 points)", () => {
      const result = computeProjectedSeries([], [], ProjectionPeriod.ThreeMonths, TODAY);
      expect(result[0].date).toBe(TODAY);
      expect(result).toHaveLength(91);
    });

    it("generates weekly points for SixMonths", () => {
      const result = computeProjectedSeries([], [], ProjectionPeriod.SixMonths, TODAY);
      expect(result[0].date).toBe(TODAY);
      const lastDate = result[result.length - 1].date;
      expect(lastDate >= "2024-12-12").toBe(true);
    });

    it("generates monthly points for OneYear", () => {
      const result = computeProjectedSeries([], [], ProjectionPeriod.OneYear, TODAY);
      expect(result[0].date).toBe(TODAY);
      expect(result).toHaveLength(13);
    });

    it("generates daily points for Custom range", () => {
      const result = computeProjectedSeries([], [], ProjectionPeriod.Custom, TODAY, {
        start: "2024-06-20",
        end: "2024-06-25",
      });
      expect(result[0].date).toBe("2024-06-20");
      expect(result[result.length - 1].date).toBe("2024-06-25");
      expect(result).toHaveLength(6);
    });
  });

  it("computes starting net worth from past transactions", () => {
    const accounts = [makeAccount("1", AccountType.Asset)];
    const transactions = [
      makeTx("1", 5000, "2024-01-01"),
      makeTx("1", 1000, "2024-06-10"),
    ];
    const result = computeProjectedSeries(
      accounts,
      transactions,
      ProjectionPeriod.OneMonth,
      TODAY
    );

    expect(result[0].netWorth).toBe(6000);
  });

  it("returns flat line with no projected transactions", () => {
    const accounts = [makeAccount("1", AccountType.Asset)];
    const transactions = [makeTx("1", 5000, "2024-01-01")];
    const result = computeProjectedSeries(
      accounts,
      transactions,
      ProjectionPeriod.OneMonth,
      TODAY
    );

    result.forEach((p) => expect(p.netWorth).toBe(5000));
  });

  it("applies projected transaction on its date", () => {
    const accounts = [makeAccount("1", AccountType.Asset)];
    const transactions = [
      makeTx("1", 5000, "2024-01-01"),
      makeTx("1", 1000, "2024-06-20"),
    ];
    const result = computeProjectedSeries(
      accounts,
      transactions,
      ProjectionPeriod.OneMonth,
      TODAY
    );

    const before = result.find((p) => p.date === "2024-06-19")!;
    const onDate = result.find((p) => p.date === "2024-06-20")!;
    expect(before.netWorth).toBe(5000);
    expect(onDate.netWorth).toBe(6000);
  });

  it("handles mix of asset and liability accounts", () => {
    const accounts = [
      makeAccount("a", AccountType.Asset),
      makeAccount("l", AccountType.Liability),
    ];
    const transactions = [
      makeTx("a", 10000, "2024-01-01"),
      makeTx("l", 3000, "2024-01-01"),
      makeTx("l", 1000, "2024-06-20"),
    ];
    const result = computeProjectedSeries(
      accounts,
      transactions,
      ProjectionPeriod.OneMonth,
      TODAY
    );

    expect(result[0].netWorth).toBe(7000);
    const afterLiability = result.find((p) => p.date === "2024-06-20")!;
    expect(afterLiability.netWorth).toBe(6000);
  });

  it("returns all zeros with no accounts or transactions", () => {
    const result = computeProjectedSeries([], [], ProjectionPeriod.OneMonth, TODAY);
    result.forEach((p) => expect(p.netWorth).toBe(0));
  });

  it("ignores transactions for unknown accounts", () => {
    const accounts = [makeAccount("1", AccountType.Asset)];
    const transactions = [
      makeTx("1", 1000, "2024-01-01"),
      makeTx("unknown", 9999, "2024-06-20"),
    ];
    const result = computeProjectedSeries(
      accounts,
      transactions,
      ProjectionPeriod.OneMonth,
      TODAY
    );

    result.forEach((p) => expect(p.netWorth).toBe(1000));
  });

  describe("recurring transactions", () => {
    it("applies monthly recurring transaction to projection", () => {
      const accounts = [makeAccount("1", AccountType.Asset)];
      const transactions = [makeTx("1", 5000, "2024-01-01")];
      const recurring: RecurringTransaction[] = [
        {
          id: "r1",
          accountId: "1",
          amount: 1000,
          description: "Salary",
          frequency: RecurrenceFrequency.Monthly,
          startDate: "2024-06-20",
        },
      ];
      const result = computeProjectedSeries(
        accounts,
        transactions,
        ProjectionPeriod.ThreeMonths,
        TODAY,
        undefined,
        recurring
      );

      const onFirst = result.find((p) => p.date === "2024-06-20")!;
      expect(onFirst.netWorth).toBe(6000);
      const onSecond = result.find((p) => p.date === "2024-07-20")!;
      expect(onSecond.netWorth).toBe(7000);
    });

    it("applies yearly recurring transaction to projection", () => {
      const accounts = [makeAccount("1", AccountType.Asset)];
      const recurring: RecurringTransaction[] = [
        {
          id: "r1",
          accountId: "1",
          amount: 500,
          description: "Annual bonus",
          frequency: RecurrenceFrequency.Yearly,
          startDate: "2024-07-01",
        },
      ];
      const result = computeProjectedSeries(
        accounts,
        [],
        ProjectionPeriod.OneYear,
        TODAY,
        undefined,
        recurring
      );

      const afterBonus = result.find((p) => p.date >= "2024-07-01");
      expect(afterBonus!.netWorth).toBe(500);
    });

    it("respects endDate for recurring transactions", () => {
      const accounts = [makeAccount("1", AccountType.Asset)];
      const recurring: RecurringTransaction[] = [
        {
          id: "r1",
          accountId: "1",
          amount: 1000,
          description: "Salary",
          frequency: RecurrenceFrequency.Monthly,
          startDate: "2024-06-20",
          endDate: "2024-08-01",
        },
      ];
      const result = computeProjectedSeries(
        accounts,
        [],
        ProjectionPeriod.ThreeMonths,
        TODAY,
        undefined,
        recurring
      );

      const afterFirst = result.find((p) => p.date === "2024-06-20")!;
      expect(afterFirst.netWorth).toBe(1000);
      const afterSecond = result.find((p) => p.date === "2024-07-20")!;
      expect(afterSecond.netWorth).toBe(2000);
      // No third occurrence — endDate is 2024-08-01
      const afterEnd = result.find((p) => p.date === "2024-08-20")!;
      expect(afterEnd.netWorth).toBe(2000);
    });

    it("mixes one-off and recurring transactions", () => {
      const accounts = [makeAccount("1", AccountType.Asset)];
      const transactions = [
        makeTx("1", 5000, "2024-01-01"),
        makeTx("1", -500, "2024-06-25"),
      ];
      const recurring: RecurringTransaction[] = [
        {
          id: "r1",
          accountId: "1",
          amount: 1000,
          description: "Salary",
          frequency: RecurrenceFrequency.Monthly,
          startDate: "2024-06-20",
        },
      ];
      const result = computeProjectedSeries(
        accounts,
        transactions,
        ProjectionPeriod.OneMonth,
        TODAY,
        undefined,
        recurring
      );

      const onSalary = result.find((p) => p.date === "2024-06-20")!;
      expect(onSalary.netWorth).toBe(6000);
      const afterExpense = result.find((p) => p.date === "2024-06-25")!;
      expect(afterExpense.netWorth).toBe(5500);
    });

    it("ignores recurring transactions for unknown accounts", () => {
      const accounts = [makeAccount("1", AccountType.Asset)];
      const recurring: RecurringTransaction[] = [
        {
          id: "r1",
          accountId: "unknown",
          amount: 9999,
          description: "Ghost",
          frequency: RecurrenceFrequency.Monthly,
          startDate: "2024-06-20",
        },
      ];
      const result = computeProjectedSeries(
        accounts,
        [],
        ProjectionPeriod.OneMonth,
        TODAY,
        undefined,
        recurring
      );

      result.forEach((p) => expect(p.netWorth).toBe(0));
    });

    it("defaults to empty array when no recurring transactions provided", () => {
      const accounts = [makeAccount("1", AccountType.Asset)];
      const transactions = [makeTx("1", 5000, "2024-01-01")];
      const result = computeProjectedSeries(
        accounts,
        transactions,
        ProjectionPeriod.OneMonth,
        TODAY
      );

      result.forEach((p) => expect(p.netWorth).toBe(5000));
    });
  });
});

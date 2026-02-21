import { describe, expect, it } from "vitest";

import type { DisplayTransaction } from "./DisplayTransaction.type";
import {
  filterDisplayTransactions,
  hasActiveFilters,
} from "./filterDisplayTransactions";
import { emptyFilters, type TransactionFilters } from "./TransactionFilters.type";

const items: DisplayTransaction[] = [
  {
    id: "1",
    description: "Groceries at Whole Foods",
    accountName: "Checking",
    date: "2024-01-15",
    amount: -200,
    isProjected: false,
    isRecurring: false,
    editAction: null,
  },
  {
    id: "2",
    description: "Monthly Salary",
    accountName: "Checking",
    date: "2024-02-01",
    amount: 5000,
    isProjected: false,
    isRecurring: true,
    editAction: null,
  },
  {
    id: "3",
    description: "Electric Bill",
    accountName: "Checking",
    date: "2024-01-20",
    amount: -150,
    isProjected: false,
    isRecurring: false,
    editAction: null,
  },
  {
    id: "4",
    description: "Freelance Payment",
    accountName: "Savings",
    date: "2024-03-10",
    amount: 1200,
    isProjected: false,
    isRecurring: false,
    editAction: null,
  },
];

describe("filterDisplayTransactions", () => {
  it("returns all items when no filters are set", () => {
    const result = filterDisplayTransactions(items, emptyFilters);
    expect(result).toHaveLength(4);
  });

  it("filters by description text (case-insensitive)", () => {
    const filters: TransactionFilters = {
      ...emptyFilters,
      description: "groceries",
    };
    const result = filterDisplayTransactions(items, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("filters by partial description match", () => {
    const filters: TransactionFilters = {
      ...emptyFilters,
      description: "bill",
    };
    const result = filterDisplayTransactions(items, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("3");
  });

  it("filters by dateFrom", () => {
    const filters: TransactionFilters = {
      ...emptyFilters,
      dateFrom: "2024-02-01",
    };
    const result = filterDisplayTransactions(items, filters);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual(["2", "4"]);
  });

  it("filters by dateTo", () => {
    const filters: TransactionFilters = {
      ...emptyFilters,
      dateTo: "2024-01-20",
    };
    const result = filterDisplayTransactions(items, filters);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual(["1", "3"]);
  });

  it("filters by date range (dateFrom and dateTo)", () => {
    const filters: TransactionFilters = {
      ...emptyFilters,
      dateFrom: "2024-01-16",
      dateTo: "2024-02-28",
    };
    const result = filterDisplayTransactions(items, filters);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual(["2", "3"]);
  });

  it("filters by amountMin", () => {
    const filters: TransactionFilters = {
      ...emptyFilters,
      amountMin: "0",
    };
    const result = filterDisplayTransactions(items, filters);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual(["2", "4"]);
  });

  it("filters by amountMax", () => {
    const filters: TransactionFilters = {
      ...emptyFilters,
      amountMax: "0",
    };
    const result = filterDisplayTransactions(items, filters);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual(["1", "3"]);
  });

  it("filters by amount range (amountMin and amountMax)", () => {
    const filters: TransactionFilters = {
      ...emptyFilters,
      amountMin: "-200",
      amountMax: "-100",
    };
    const result = filterDisplayTransactions(items, filters);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual(["1", "3"]);
  });

  it("combines description and date filters", () => {
    const filters: TransactionFilters = {
      ...emptyFilters,
      description: "salary",
      dateFrom: "2024-01-01",
    };
    const result = filterDisplayTransactions(items, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("combines all filters", () => {
    const filters: TransactionFilters = {
      ...emptyFilters,
      description: "payment",
      dateFrom: "2024-03-01",
      dateTo: "2024-03-31",
      amountMin: "1000",
      amountMax: "2000",
    };
    const result = filterDisplayTransactions(items, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("4");
  });

  it("returns empty array when no items match", () => {
    const filters: TransactionFilters = {
      ...emptyFilters,
      description: "nonexistent",
    };
    const result = filterDisplayTransactions(items, filters);
    expect(result).toHaveLength(0);
  });

  it("ignores invalid amountMin value", () => {
    const filters: TransactionFilters = {
      ...emptyFilters,
      amountMin: "abc",
    };
    const result = filterDisplayTransactions(items, filters);
    expect(result).toHaveLength(4);
  });

  it("ignores invalid amountMax value", () => {
    const filters: TransactionFilters = {
      ...emptyFilters,
      amountMax: "xyz",
    };
    const result = filterDisplayTransactions(items, filters);
    expect(result).toHaveLength(4);
  });

  it("includes items on the exact dateFrom boundary", () => {
    const filters: TransactionFilters = {
      ...emptyFilters,
      dateFrom: "2024-01-15",
    };
    const result = filterDisplayTransactions(items, filters);
    expect(result.map((r) => r.id)).toContain("1");
  });

  it("includes items on the exact dateTo boundary", () => {
    const filters: TransactionFilters = {
      ...emptyFilters,
      dateTo: "2024-03-10",
    };
    const result = filterDisplayTransactions(items, filters);
    expect(result.map((r) => r.id)).toContain("4");
  });
});

describe("hasActiveFilters", () => {
  it("returns false for empty filters", () => {
    expect(hasActiveFilters(emptyFilters)).toBe(false);
  });

  it("returns true when description is set", () => {
    expect(hasActiveFilters({ ...emptyFilters, description: "test" })).toBe(true);
  });

  it("returns true when dateFrom is set", () => {
    expect(hasActiveFilters({ ...emptyFilters, dateFrom: "2024-01-01" })).toBe(true);
  });

  it("returns true when dateTo is set", () => {
    expect(hasActiveFilters({ ...emptyFilters, dateTo: "2024-12-31" })).toBe(true);
  });

  it("returns true when amountMin is set", () => {
    expect(hasActiveFilters({ ...emptyFilters, amountMin: "0" })).toBe(true);
  });

  it("returns true when amountMax is set", () => {
    expect(hasActiveFilters({ ...emptyFilters, amountMax: "1000" })).toBe(true);
  });
});

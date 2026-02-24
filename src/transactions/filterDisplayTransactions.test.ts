import { describe, expect, it } from "vitest";

import type { DisplayTransaction } from "./DisplayTransaction.type";
import {
  filterDisplayTransactions,
  hasActiveFilters,
} from "./filterDisplayTransactions";
import { emptyFilters } from "./TransactionFilters.type";

const items: DisplayTransaction[] = [
  {
    id: "1",
    accountId: "a1",
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
    accountId: "a1",
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
    accountId: "a1",
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
    accountId: "a2",
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

  it.each([
    {
      name: "description text (case-insensitive)",
      filters: { description: "groceries" },
      expectedIds: ["1"],
    },
    {
      name: "partial description match",
      filters: { description: "bill" },
      expectedIds: ["3"],
    },
    {
      name: "dateFrom",
      filters: { dateFrom: "2024-02-01" },
      expectedIds: ["2", "4"],
    },
    {
      name: "dateTo",
      filters: { dateTo: "2024-01-20" },
      expectedIds: ["1", "3"],
    },
    {
      name: "date range (dateFrom and dateTo)",
      filters: { dateFrom: "2024-01-16", dateTo: "2024-02-28" },
      expectedIds: ["2", "3"],
    },
    {
      name: "amountMin",
      filters: { amountMin: "0" },
      expectedIds: ["2", "4"],
    },
    {
      name: "amountMax",
      filters: { amountMax: "0" },
      expectedIds: ["1", "3"],
    },
    {
      name: "amount range (amountMin and amountMax)",
      filters: { amountMin: "-200", amountMax: "-100" },
      expectedIds: ["1", "3"],
    },
    {
      name: "combined description and date",
      filters: { description: "salary", dateFrom: "2024-01-01" },
      expectedIds: ["2"],
    },
    {
      name: "all filters combined",
      filters: {
        description: "payment",
        dateFrom: "2024-03-01",
        dateTo: "2024-03-31",
        amountMin: "1000",
        amountMax: "2000",
      },
      expectedIds: ["4"],
    },
    {
      name: "no items match",
      filters: { description: "nonexistent" },
      expectedIds: [],
    },
  ])("filters by $name", ({ filters, expectedIds }) => {
    const result = filterDisplayTransactions(items, { ...emptyFilters, ...filters });
    expect(result.map((r) => r.id)).toEqual(expectedIds);
  });

  it.each([
    { name: "amountMin", filters: { amountMin: "abc" } },
    { name: "amountMax", filters: { amountMax: "xyz" } },
  ])("ignores invalid $name value", ({ filters }) => {
    const result = filterDisplayTransactions(items, { ...emptyFilters, ...filters });
    expect(result).toHaveLength(4);
  });

  it.each([
    {
      name: "dateFrom boundary",
      filters: { dateFrom: "2024-01-15" },
      expectedId: "1",
    },
    {
      name: "dateTo boundary",
      filters: { dateTo: "2024-03-10" },
      expectedId: "4",
    },
  ])("includes items on the exact $name", ({ filters, expectedId }) => {
    const result = filterDisplayTransactions(items, { ...emptyFilters, ...filters });
    expect(result.map((r) => r.id)).toContain(expectedId);
  });
});

describe("hasActiveFilters", () => {
  it("returns false for empty filters", () => {
    expect(hasActiveFilters(emptyFilters)).toBe(false);
  });

  it.each([
    { field: "description", value: "test" },
    { field: "dateFrom", value: "2024-01-01" },
    { field: "dateTo", value: "2024-12-31" },
    { field: "amountMin", value: "0" },
    { field: "amountMax", value: "1000" },
  ] as const)("returns true when $field is set", ({ field, value }) => {
    expect(hasActiveFilters({ ...emptyFilters, [field]: value })).toBe(true);
  });
});

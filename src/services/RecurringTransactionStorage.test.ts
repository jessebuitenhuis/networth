import { describe, expect, it, beforeEach } from "vitest";
import {
  loadRecurringTransactions,
  saveRecurringTransactions,
} from "./RecurringTransactionStorage";
import { RecurrenceFrequency } from "@/models/RecurrenceFrequency";
import type { RecurringTransaction } from "@/models/RecurringTransaction";

const recurring: RecurringTransaction = {
  id: "r1",
  accountId: "a1",
  amount: 5000,
  description: "Salary",
  frequency: RecurrenceFrequency.Monthly,
  startDate: "2024-01-15",
};

describe("RecurringTransactionStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("loadRecurringTransactions", () => {
    it("returns empty array when nothing is stored", () => {
      expect(loadRecurringTransactions()).toEqual([]);
    });

    it("returns stored recurring transactions", () => {
      localStorage.setItem(
        "recurringTransactions",
        JSON.stringify([recurring])
      );

      expect(loadRecurringTransactions()).toEqual([recurring]);
    });

    it("returns empty array when stored data is invalid JSON", () => {
      localStorage.setItem("recurringTransactions", "not-json");

      expect(loadRecurringTransactions()).toEqual([]);
    });
  });

  describe("saveRecurringTransactions", () => {
    it("persists recurring transactions to localStorage", () => {
      saveRecurringTransactions([recurring]);

      expect(
        JSON.parse(localStorage.getItem("recurringTransactions")!)
      ).toEqual([recurring]);
    });

    it("overwrites previously stored recurring transactions", () => {
      const second: RecurringTransaction = {
        id: "r2",
        accountId: "a1",
        amount: 1200,
        description: "Rent",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2024-02-01",
      };

      saveRecurringTransactions([recurring]);
      saveRecurringTransactions([second]);

      expect(
        JSON.parse(localStorage.getItem("recurringTransactions")!)
      ).toEqual([second]);
    });
  });
});

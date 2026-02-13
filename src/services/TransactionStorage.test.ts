import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Transaction } from "@/models/Transaction.type";

import { loadTransactions, saveTransactions } from "./TransactionStorage";

const transaction: Transaction = {
  id: "t1",
  accountId: "a1",
  amount: 500,
  date: "2024-01-15",
  description: "Opening balance",
};

describe("TransactionStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("loadTransactions", () => {
    it("returns empty array when nothing is stored", () => {
      expect(loadTransactions()).toEqual([]);
    });

    it("returns stored transactions", () => {
      localStorage.setItem("transactions", JSON.stringify([transaction]));

      expect(loadTransactions()).toEqual([transaction]);
    });

    it("returns empty array when stored data is invalid JSON", () => {
      localStorage.setItem("transactions", "not-json");

      expect(loadTransactions()).toEqual([]);
    });

    it("returns empty array on server side (window undefined)", () => {
      const originalWindow = global.window;
      vi.stubGlobal("window", undefined);

      expect(loadTransactions()).toEqual([]);

      vi.stubGlobal("window", originalWindow);
    });
  });

  describe("saveTransactions", () => {
    it("persists transactions to localStorage", () => {
      saveTransactions([transaction]);

      expect(JSON.parse(localStorage.getItem("transactions")!)).toEqual([
        transaction,
      ]);
    });

    it("overwrites previously stored transactions", () => {
      const second: Transaction = {
        id: "t2",
        accountId: "a1",
        amount: -100,
        date: "2024-01-16",
        description: "Groceries",
      };

      saveTransactions([transaction]);
      saveTransactions([second]);

      expect(JSON.parse(localStorage.getItem("transactions")!)).toEqual([
        second,
      ]);
    });

    it("does nothing on server side (window undefined)", () => {
      const originalWindow = global.window;
      vi.stubGlobal("window", undefined);

      saveTransactions([transaction]);

      expect(localStorage.getItem("transactions")).toBeNull();

      vi.stubGlobal("window", originalWindow);
    });
  });
});

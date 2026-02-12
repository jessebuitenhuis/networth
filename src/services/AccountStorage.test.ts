import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  loadAccounts,
  saveAccounts,
  migrateAccountBalances,
} from "./AccountStorage";
import { AccountType } from "@/models/AccountType";
import type { Account } from "@/models/Account.type";

describe("AccountStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("loadAccounts", () => {
    it("returns empty array when nothing is stored", () => {
      expect(loadAccounts()).toEqual([]);
    });

    it("returns stored accounts", () => {
      const accounts: Account[] = [
        { id: "1", name: "Checking", type: AccountType.Asset },
      ];
      localStorage.setItem("accounts", JSON.stringify(accounts));

      expect(loadAccounts()).toEqual(accounts);
    });

    it("returns empty array when stored data is invalid JSON", () => {
      localStorage.setItem("accounts", "not-json");

      expect(loadAccounts()).toEqual([]);
    });

    it("returns empty array on server side (window undefined)", () => {
      const originalWindow = global.window;
      vi.stubGlobal("window", undefined);

      expect(loadAccounts()).toEqual([]);

      vi.stubGlobal("window", originalWindow);
    });
  });

  describe("saveAccounts", () => {
    it("persists accounts to localStorage", () => {
      const accounts: Account[] = [
        { id: "1", name: "Savings", type: AccountType.Asset },
      ];

      saveAccounts(accounts);

      expect(JSON.parse(localStorage.getItem("accounts")!)).toEqual(accounts);
    });

    it("overwrites previously stored accounts", () => {
      const first: Account[] = [
        { id: "1", name: "Old", type: AccountType.Asset },
      ];
      const second: Account[] = [
        { id: "2", name: "New", type: AccountType.Liability },
      ];

      saveAccounts(first);
      saveAccounts(second);

      expect(JSON.parse(localStorage.getItem("accounts")!)).toEqual(second);
    });

    it("does nothing on server side (window undefined)", () => {
      const originalWindow = global.window;
      vi.stubGlobal("window", undefined);

      const accounts: Account[] = [
        { id: "1", name: "Test", type: AccountType.Asset },
      ];
      saveAccounts(accounts);

      expect(localStorage.getItem("accounts")).toBeNull();

      vi.stubGlobal("window", originalWindow);
    });
  });

  describe("migrateAccountBalances", () => {
    it("returns empty array when no accounts stored", () => {
      expect(migrateAccountBalances()).toEqual([]);
    });

    it("skips migration when transactions already exist", () => {
      localStorage.setItem(
        "accounts",
        JSON.stringify([
          { id: "1", name: "Checking", type: AccountType.Asset, balance: 1000 },
        ])
      );
      localStorage.setItem("transactions", JSON.stringify([]));

      expect(migrateAccountBalances()).toEqual([]);

      const accounts = JSON.parse(localStorage.getItem("accounts")!);
      expect(accounts[0].balance).toBe(1000);
    });

    it("creates opening balance transactions for accounts with non-zero balance", () => {
      localStorage.setItem(
        "accounts",
        JSON.stringify([
          { id: "1", name: "Checking", type: AccountType.Asset, balance: 1000 },
          { id: "2", name: "Credit Card", type: AccountType.Liability, balance: 500 },
        ])
      );

      const transactions = migrateAccountBalances();

      expect(transactions).toHaveLength(2);
      expect(transactions[0]).toMatchObject({
        accountId: "1",
        amount: 1000,
        description: "Opening balance",
      });
      expect(transactions[1]).toMatchObject({
        accountId: "2",
        amount: 500,
        description: "Opening balance",
      });
    });

    it("skips accounts with zero balance", () => {
      localStorage.setItem(
        "accounts",
        JSON.stringify([
          { id: "1", name: "Empty", type: AccountType.Asset, balance: 0 },
        ])
      );

      const transactions = migrateAccountBalances();

      expect(transactions).toHaveLength(0);
    });

    it("removes balance field from stored accounts after migration", () => {
      localStorage.setItem(
        "accounts",
        JSON.stringify([
          { id: "1", name: "Checking", type: AccountType.Asset, balance: 1000 },
        ])
      );

      migrateAccountBalances();

      const accounts = JSON.parse(localStorage.getItem("accounts")!);
      expect(accounts[0]).toEqual({
        id: "1",
        name: "Checking",
        type: AccountType.Asset,
      });
    });

    it("skips accounts without balance field", () => {
      localStorage.setItem(
        "accounts",
        JSON.stringify([
          { id: "1", name: "No Balance", type: AccountType.Asset },
        ])
      );

      const transactions = migrateAccountBalances();

      expect(transactions).toHaveLength(0);
    });

    it("returns empty array when stored data is invalid JSON", () => {
      localStorage.setItem("accounts", "not-json");

      expect(migrateAccountBalances()).toEqual([]);
    });

    it("returns empty array on server side (window undefined)", () => {
      const originalWindow = global.window;
      vi.stubGlobal("window", undefined);

      expect(migrateAccountBalances()).toEqual([]);

      vi.stubGlobal("window", originalWindow);
    });
  });
});

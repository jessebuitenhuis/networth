import { describe, expect, it, beforeEach } from "vitest";
import { loadAccounts, saveAccounts } from "./AccountStorage";
import { AccountType } from "@/models/AccountType";
import type { Account } from "@/models/Account";

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
        { id: "1", name: "Checking", type: AccountType.Asset, balance: 1000 },
      ];
      localStorage.setItem("accounts", JSON.stringify(accounts));

      expect(loadAccounts()).toEqual(accounts);
    });

    it("returns empty array when stored data is invalid JSON", () => {
      localStorage.setItem("accounts", "not-json");

      expect(loadAccounts()).toEqual([]);
    });
  });

  describe("saveAccounts", () => {
    it("persists accounts to localStorage", () => {
      const accounts: Account[] = [
        { id: "1", name: "Savings", type: AccountType.Asset, balance: 5000 },
      ];

      saveAccounts(accounts);

      expect(JSON.parse(localStorage.getItem("accounts")!)).toEqual(accounts);
    });

    it("overwrites previously stored accounts", () => {
      const first: Account[] = [
        { id: "1", name: "Old", type: AccountType.Asset, balance: 100 },
      ];
      const second: Account[] = [
        { id: "2", name: "New", type: AccountType.Liability, balance: 200 },
      ];

      saveAccounts(first);
      saveAccounts(second);

      expect(JSON.parse(localStorage.getItem("accounts")!)).toEqual(second);
    });
  });
});

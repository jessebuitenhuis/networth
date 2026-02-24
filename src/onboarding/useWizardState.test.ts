import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AccountType } from "@/accounts/AccountType";

import { useWizardState } from "./useWizardState";

describe("useWizardState", () => {
  describe("account management", () => {
    it("starts with no accounts", () => {
      const { result } = renderHook(() => useWizardState());
      expect(result.current.data.accounts).toEqual([]);
    });

    it("adds an account", () => {
      const { result } = renderHook(() => useWizardState());
      act(() =>
        result.current.addAccount({
          tempId: "a1",
          name: "Checking",
          type: AccountType.Asset,
          balance: 1000,
        }),
      );
      expect(result.current.data.accounts).toHaveLength(1);
      expect(result.current.data.accounts[0].name).toBe("Checking");
    });

    it("removes an account", () => {
      const { result } = renderHook(() => useWizardState());
      act(() =>
        result.current.addAccount({
          tempId: "a1",
          name: "Checking",
          type: AccountType.Asset,
          balance: 1000,
        }),
      );
      act(() => result.current.removeAccount("a1"));
      expect(result.current.data.accounts).toHaveLength(0);
    });

    it("removes associated recurring entries when account is removed", () => {
      const { result } = renderHook(() => useWizardState());
      act(() =>
        result.current.addAccount({
          tempId: "a1",
          name: "Checking",
          type: AccountType.Asset,
          balance: 1000,
        }),
      );
      act(() =>
        result.current.addRecurringEntry({
          tempId: "r1",
          description: "Salary",
          amount: 5000,
          accountTempId: "a1",
        }),
      );
      act(() => result.current.removeAccount("a1"));
      expect(result.current.data.recurringEntries).toHaveLength(0);
    });

    it("updates an account balance", () => {
      const { result } = renderHook(() => useWizardState());
      act(() =>
        result.current.addAccount({
          tempId: "a1",
          name: "Checking",
          type: AccountType.Asset,
          balance: 1000,
        }),
      );
      act(() => result.current.updateAccount("a1", { balance: 2000 }));
      expect(result.current.data.accounts[0].balance).toBe(2000);
    });

    it("updates an account return rate", () => {
      const { result } = renderHook(() => useWizardState());
      act(() =>
        result.current.addAccount({
          tempId: "a1",
          name: "401k",
          type: AccountType.Asset,
          balance: 50000,
          expectedReturnRate: 7,
        }),
      );
      act(() => result.current.updateAccount("a1", { expectedReturnRate: 10 }));
      expect(result.current.data.accounts[0].expectedReturnRate).toBe(10);
    });
  });

  describe("recurring entry management", () => {
    it("starts with no recurring entries", () => {
      const { result } = renderHook(() => useWizardState());
      expect(result.current.data.recurringEntries).toEqual([]);
    });

    it("adds a recurring entry", () => {
      const { result } = renderHook(() => useWizardState());
      act(() =>
        result.current.addRecurringEntry({
          tempId: "r1",
          description: "Salary",
          amount: 5000,
          accountTempId: "a1",
        }),
      );
      expect(result.current.data.recurringEntries).toHaveLength(1);
    });

    it("removes a recurring entry", () => {
      const { result } = renderHook(() => useWizardState());
      act(() =>
        result.current.addRecurringEntry({
          tempId: "r1",
          description: "Salary",
          amount: 5000,
          accountTempId: "a1",
        }),
      );
      act(() => result.current.removeRecurringEntry("r1"));
      expect(result.current.data.recurringEntries).toHaveLength(0);
    });

    it("updates a recurring entry amount", () => {
      const { result } = renderHook(() => useWizardState());
      act(() =>
        result.current.addRecurringEntry({
          tempId: "r1",
          description: "Salary",
          amount: 5000,
          accountTempId: "a1",
        }),
      );
      act(() => result.current.updateRecurringEntry("r1", { amount: 6000 }));
      expect(result.current.data.recurringEntries[0].amount).toBe(6000);
    });
  });

  describe("goal management", () => {
    it("starts with no goal", () => {
      const { result } = renderHook(() => useWizardState());
      expect(result.current.data.goal).toBeNull();
    });

    it("sets a goal", () => {
      const { result } = renderHook(() => useWizardState());
      act(() =>
        result.current.setGoal({ name: "Retirement", targetAmount: 1000000 }),
      );
      expect(result.current.data.goal).toEqual({
        name: "Retirement",
        targetAmount: 1000000,
      });
    });

    it("clears a goal", () => {
      const { result } = renderHook(() => useWizardState());
      act(() =>
        result.current.setGoal({ name: "Retirement", targetAmount: 1000000 }),
      );
      act(() => result.current.setGoal(null));
      expect(result.current.data.goal).toBeNull();
    });
  });
});

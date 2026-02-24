import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AccountType } from "@/accounts/AccountType";

import { SetupStep } from "./SetupStep";
import { useWizardState } from "./useWizardState";

describe("useWizardState", () => {
  describe("step navigation", () => {
    it("starts at Accounts step", () => {
      const { result } = renderHook(() => useWizardState());
      expect(result.current.step).toBe(SetupStep.Accounts);
    });

    it("advances to next step", () => {
      const { result } = renderHook(() => useWizardState());
      act(() => result.current.nextStep());
      expect(result.current.step).toBe(SetupStep.IncomeExpenses);
    });

    it("goes back to previous step", () => {
      const { result } = renderHook(() => useWizardState());
      act(() => result.current.nextStep());
      act(() => result.current.prevStep());
      expect(result.current.step).toBe(SetupStep.Accounts);
    });

    it("does not go before first step", () => {
      const { result } = renderHook(() => useWizardState());
      act(() => result.current.prevStep());
      expect(result.current.step).toBe(SetupStep.Accounts);
    });

    it("reports isLastStep correctly", () => {
      const { result } = renderHook(() => useWizardState());
      expect(result.current.isLastStep).toBe(false);
      act(() => result.current.nextStep());
      act(() => result.current.nextStep());
      act(() => result.current.nextStep());
      expect(result.current.isLastStep).toBe(true);
    });

    it("reports isFirstStep correctly", () => {
      const { result } = renderHook(() => useWizardState());
      expect(result.current.isFirstStep).toBe(true);
      act(() => result.current.nextStep());
      expect(result.current.isFirstStep).toBe(false);
    });

    it("reports stepIndex correctly", () => {
      const { result } = renderHook(() => useWizardState());
      expect(result.current.stepIndex).toBe(0);
      act(() => result.current.nextStep());
      expect(result.current.stepIndex).toBe(1);
    });
  });

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

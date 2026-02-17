"use client";

import { createContext, useContext, useEffect, useReducer } from "react";

import type { RecurringTransaction } from "./RecurringTransaction.type";

export type RecurringTransactionAction =
  | { type: "add"; recurringTransaction: RecurringTransaction }
  | { type: "remove"; id: string }
  | { type: "removeByScenarioId"; scenarioId: string }
  | { type: "set"; recurringTransactions: RecurringTransaction[] }
  | { type: "update"; recurringTransaction: RecurringTransaction };

export function recurringTransactionReducer(
  state: RecurringTransaction[],
  action: RecurringTransactionAction,
): RecurringTransaction[] {
  switch (action.type) {
    case "add":
      return [...state, action.recurringTransaction];
    case "remove":
      return state.filter((rt) => rt.id !== action.id);
    case "removeByScenarioId":
      return state.filter((rt) => rt.scenarioId !== action.scenarioId);
    case "set":
      return action.recurringTransactions;
    case "update":
      return state.map((rt) =>
        rt.id === action.recurringTransaction.id
          ? action.recurringTransaction
          : rt,
      );
  }
}

type RecurringTransactionContextValue = {
  recurringTransactions: RecurringTransaction[];
  addRecurringTransaction: (rt: RecurringTransaction) => Promise<void>;
  removeRecurringTransaction: (id: string) => Promise<void>;
  removeRecurringTransactionsByScenarioId: (
    scenarioId: string,
  ) => Promise<void>;
  updateRecurringTransaction: (rt: RecurringTransaction) => Promise<void>;
};

const RecurringTransactionContext =
  createContext<RecurringTransactionContextValue | null>(null);

export function RecurringTransactionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [recurringTransactions, dispatch] = useReducer(
    recurringTransactionReducer,
    [],
  );

  useEffect(() => {
    fetch("/api/recurring-transactions")
      .then((res) => res.json())
      .then((data) =>
        dispatch({ type: "set", recurringTransactions: data }),
      );
  }, []);

  async function addRecurringTransaction(rt: RecurringTransaction) {
    await fetch("/api/recurring-transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rt),
    });
    dispatch({ type: "add", recurringTransaction: rt });
  }

  async function removeRecurringTransaction(id: string) {
    await fetch(`/api/recurring-transactions/${id}`, { method: "DELETE" });
    dispatch({ type: "remove", id });
  }

  async function removeRecurringTransactionsByScenarioId(scenarioId: string) {
    await fetch(`/api/recurring-transactions?scenarioId=${scenarioId}`, {
      method: "DELETE",
    });
    dispatch({ type: "removeByScenarioId", scenarioId });
  }

  async function updateRecurringTransaction(rt: RecurringTransaction) {
    await fetch(`/api/recurring-transactions/${rt.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rt),
    });
    dispatch({ type: "update", recurringTransaction: rt });
  }

  return (
    <RecurringTransactionContext
      value={{
        recurringTransactions,
        addRecurringTransaction,
        removeRecurringTransaction,
        removeRecurringTransactionsByScenarioId,
        updateRecurringTransaction,
      }}
    >
      {children}
    </RecurringTransactionContext>
  );
}

export function useRecurringTransactions(): RecurringTransactionContextValue {
  const ctx = useContext(RecurringTransactionContext);
  if (!ctx) {
    throw new Error(
      "useRecurringTransactions must be used within RecurringTransactionProvider",
    );
  }
  return ctx;
}

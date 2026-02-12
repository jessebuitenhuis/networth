"use client";

import { createContext, useContext, useEffect, useReducer } from "react";
import type { RecurringTransaction } from "@/models/RecurringTransaction";
import {
  loadRecurringTransactions,
  saveRecurringTransactions,
} from "@/services/RecurringTransactionStorage";

export type RecurringTransactionAction =
  | { type: "add"; recurringTransaction: RecurringTransaction }
  | { type: "remove"; id: string }
  | { type: "removeByScenarioId"; scenarioId: string }
  | { type: "set"; recurringTransactions: RecurringTransaction[] }
  | { type: "update"; recurringTransaction: RecurringTransaction };

export function recurringTransactionReducer(
  state: RecurringTransaction[],
  action: RecurringTransactionAction
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
      return state.map((rt) => (rt.id === action.recurringTransaction.id ? action.recurringTransaction : rt));
  }
}

type RecurringTransactionContextValue = {
  recurringTransactions: RecurringTransaction[];
  addRecurringTransaction: (rt: RecurringTransaction) => void;
  removeRecurringTransaction: (id: string) => void;
  removeRecurringTransactionsByScenarioId: (scenarioId: string) => void;
  updateRecurringTransaction: (rt: RecurringTransaction) => void;
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
    []
  );

  useEffect(() => {
    const stored = loadRecurringTransactions();
    dispatch({ type: "set", recurringTransactions: stored });
  }, []);

  useEffect(() => {
    saveRecurringTransactions(recurringTransactions);
  }, [recurringTransactions]);

  function addRecurringTransaction(rt: RecurringTransaction) {
    dispatch({ type: "add", recurringTransaction: rt });
  }

  function removeRecurringTransaction(id: string) {
    dispatch({ type: "remove", id });
  }

  function removeRecurringTransactionsByScenarioId(scenarioId: string) {
    dispatch({ type: "removeByScenarioId", scenarioId });
  }

  function updateRecurringTransaction(rt: RecurringTransaction) {
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
      "useRecurringTransactions must be used within RecurringTransactionProvider"
    );
  }
  return ctx;
}

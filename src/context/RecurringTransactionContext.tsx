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
  | { type: "set"; recurringTransactions: RecurringTransaction[] };

export function recurringTransactionReducer(
  state: RecurringTransaction[],
  action: RecurringTransactionAction
): RecurringTransaction[] {
  switch (action.type) {
    case "add":
      return [...state, action.recurringTransaction];
    case "remove":
      return state.filter((rt) => rt.id !== action.id);
    case "set":
      return action.recurringTransactions;
  }
}

type RecurringTransactionContextValue = {
  recurringTransactions: RecurringTransaction[];
  addRecurringTransaction: (rt: RecurringTransaction) => void;
  removeRecurringTransaction: (id: string) => void;
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

  return (
    <RecurringTransactionContext
      value={{
        recurringTransactions,
        addRecurringTransaction,
        removeRecurringTransaction,
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

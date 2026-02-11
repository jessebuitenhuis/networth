"use client";

import { createContext, useCallback, useContext, useEffect, useReducer } from "react";
import type { Transaction } from "@/models/Transaction";
import {
  loadTransactions,
  saveTransactions,
} from "@/services/TransactionStorage";
import { migrateAccountBalances } from "@/services/AccountStorage";
import { computeBalance } from "@/services/computeBalance";

export type TransactionAction =
  | { type: "add"; transaction: Transaction }
  | { type: "remove"; id: string }
  | { type: "set"; transactions: Transaction[] };

export function transactionReducer(
  state: Transaction[],
  action: TransactionAction
): Transaction[] {
  switch (action.type) {
    case "add":
      return [...state, action.transaction];
    case "remove":
      return state.filter((t) => t.id !== action.id);
    case "set":
      return action.transactions;
  }
}

type TransactionContextValue = {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  removeTransaction: (id: string) => void;
  getBalance: (accountId: string) => number;
};

const TransactionContext = createContext<TransactionContextValue | null>(null);

export function TransactionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [transactions, dispatch] = useReducer(transactionReducer, []);

  useEffect(() => {
    const migrated = migrateAccountBalances();
    const stored = loadTransactions();
    dispatch({ type: "set", transactions: [...stored, ...migrated] });
  }, []);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  function addTransaction(transaction: Transaction) {
    dispatch({ type: "add", transaction });
  }

  function removeTransaction(id: string) {
    dispatch({ type: "remove", id });
  }

  const getBalance = useCallback(
    (accountId: string) => computeBalance(accountId, transactions),
    [transactions]
  );

  return (
    <TransactionContext value={{ transactions, addTransaction, removeTransaction, getBalance }}>
      {children}
    </TransactionContext>
  );
}

export function useTransactions(): TransactionContextValue {
  const ctx = useContext(TransactionContext);
  if (!ctx) {
    throw new Error(
      "useTransactions must be used within TransactionProvider"
    );
  }
  return ctx;
}

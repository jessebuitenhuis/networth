"use client";

import { createContext, useCallback, useContext, useEffect, useReducer } from "react";
import type { Transaction } from "@/models/Transaction";
import {
  loadTransactions,
  saveTransactions,
} from "@/services/TransactionStorage";
import { migrateAccountBalances } from "@/services/AccountStorage";
import { computeBalance } from "@/services/computeBalance";
import { formatDate } from "@/lib/dateUtils";

export type TransactionAction =
  | { type: "add"; transaction: Transaction }
  | { type: "remove"; id: string }
  | { type: "removeByAccountId"; accountId: string }
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
    case "removeByAccountId":
      return state.filter((t) => t.accountId !== action.accountId);
    case "set":
      return action.transactions;
  }
}

type TransactionContextValue = {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  removeTransaction: (id: string) => void;
  removeTransactionsByAccountId: (accountId: string) => void;
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

  function removeTransactionsByAccountId(accountId: string) {
    dispatch({ type: "removeByAccountId", accountId });
  }

  const getBalance = useCallback(
    (accountId: string) =>
      computeBalance(accountId, transactions, formatDate(new Date())),
    [transactions]
  );

  return (
    <TransactionContext value={{ transactions, addTransaction, removeTransaction, removeTransactionsByAccountId, getBalance }}>
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

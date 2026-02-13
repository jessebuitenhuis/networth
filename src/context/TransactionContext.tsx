"use client";

import { createContext, useCallback, useContext, useEffect, useReducer } from "react";

import { formatDate } from "@/lib/dateUtils";
import type { Transaction } from "@/models/Transaction.type";
import { migrateAccountBalances } from "@/services/AccountStorage";
import { computeBalance } from "@/services/computeBalance";
import {
  loadTransactions,
  saveTransactions,
} from "@/services/TransactionStorage";

export type TransactionAction =
  | { type: "add"; transaction: Transaction }
  | { type: "remove"; id: string }
  | { type: "removeByAccountId"; accountId: string }
  | { type: "removeByScenarioId"; scenarioId: string }
  | { type: "set"; transactions: Transaction[] }
  | { type: "update"; transaction: Transaction };

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
    case "removeByScenarioId":
      return state.filter((t) => t.scenarioId !== action.scenarioId);
    case "set":
      return action.transactions;
    case "update":
      return state.map((t) => (t.id === action.transaction.id ? action.transaction : t));
  }
}

type TransactionContextValue = {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  removeTransaction: (id: string) => void;
  removeTransactionsByAccountId: (accountId: string) => void;
  removeTransactionsByScenarioId: (scenarioId: string) => void;
  updateTransaction: (transaction: Transaction) => void;
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

  function removeTransactionsByScenarioId(scenarioId: string) {
    dispatch({ type: "removeByScenarioId", scenarioId });
  }

  function updateTransaction(transaction: Transaction) {
    dispatch({ type: "update", transaction });
  }

  const getBalance = useCallback(
    (accountId: string) =>
      computeBalance(accountId, transactions, formatDate(new Date())),
    [transactions]
  );

  return (
    <TransactionContext value={{ transactions, addTransaction, removeTransaction, removeTransactionsByAccountId, removeTransactionsByScenarioId, updateTransaction, getBalance }}>
      {children}
    </TransactionContext>
  );
}

export function useTransactions(): TransactionContextValue {
  const ctx = useContext(TransactionContext);
  // AGENT: Is this check needed? Is this not handled in useContext?
  if (!ctx) {
    throw new Error(
      "useTransactions must be used within TransactionProvider"
    );
  }
  return ctx;
}

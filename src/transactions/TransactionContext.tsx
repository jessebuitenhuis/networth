"use client";

import { createContext, useCallback, useContext, useEffect, useReducer } from "react";

import { computeBalance } from "@/accounts/computeBalance";
import { formatDate } from "@/lib/dateUtils";

import type { Transaction } from "./Transaction.type";

export type TransactionAction =
  | { type: "add"; transaction: Transaction }
  | { type: "addMany"; transactions: Transaction[] }
  | { type: "remove"; id: string }
  | { type: "removeByAccountId"; accountId: string }
  | { type: "removeByScenarioId"; scenarioId: string }
  | { type: "set"; transactions: Transaction[] }
  | { type: "update"; transaction: Transaction };

export function transactionReducer(
  state: Transaction[],
  action: TransactionAction,
): Transaction[] {
  switch (action.type) {
    case "add":
      return [...state, action.transaction];
    case "addMany":
      return [...state, ...action.transactions];
    case "remove":
      return state.filter((t) => t.id !== action.id);
    case "removeByAccountId":
      return state.filter((t) => t.accountId !== action.accountId);
    case "removeByScenarioId":
      return state.filter((t) => t.scenarioId !== action.scenarioId);
    case "set":
      return action.transactions;
    case "update":
      return state.map((t) =>
        t.id === action.transaction.id ? action.transaction : t,
      );
  }
}

type TransactionContextValue = {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => Promise<void>;
  addTransactions: (transactions: Transaction[]) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  removeTransactionsByAccountId: (accountId: string) => Promise<void>;
  removeTransactionsByScenarioId: (scenarioId: string) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
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
    fetch("/api/transactions")
      .then((res) => res.json())
      .then((data) => dispatch({ type: "set", transactions: data }));
  }, []);

  async function addTransaction(transaction: Transaction) {
    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transaction),
    });
    dispatch({ type: "add", transaction });
  }

  async function addTransactions(txns: Transaction[]) {
    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(txns),
    });
    dispatch({ type: "addMany", transactions: txns });
  }

  async function removeTransaction(id: string) {
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    dispatch({ type: "remove", id });
  }

  async function removeTransactionsByAccountId(accountId: string) {
    await fetch(`/api/transactions?accountId=${accountId}`, {
      method: "DELETE",
    });
    dispatch({ type: "removeByAccountId", accountId });
  }

  async function removeTransactionsByScenarioId(scenarioId: string) {
    await fetch(`/api/transactions?scenarioId=${scenarioId}`, {
      method: "DELETE",
    });
    dispatch({ type: "removeByScenarioId", scenarioId });
  }

  async function updateTransaction(transaction: Transaction) {
    await fetch(`/api/transactions/${transaction.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transaction),
    });
    dispatch({ type: "update", transaction });
  }

  const getBalance = useCallback(
    (accountId: string) =>
      computeBalance(accountId, transactions, formatDate(new Date())),
    [transactions],
  );

  return (
    <TransactionContext
      value={{
        transactions,
        addTransaction,
        addTransactions,
        removeTransaction,
        removeTransactionsByAccountId,
        removeTransactionsByScenarioId,
        updateTransaction,
        getBalance,
      }}
    >
      {children}
    </TransactionContext>
  );
}

export function useTransactions(): TransactionContextValue {
  const ctx = useContext(TransactionContext);
  if (!ctx) {
    throw new Error(
      "useTransactions must be used within TransactionProvider",
    );
  }
  return ctx;
}

"use client";

import { createContext, useContext, useEffect, useReducer } from "react";

import type { Account } from "./Account.type";

export type AccountAction =
  | { type: "add"; account: Account }
  | { type: "remove"; id: string }
  | { type: "update"; account: Account }
  | { type: "set"; accounts: Account[] };

export function accountReducer(
  state: Account[],
  action: AccountAction,
): Account[] {
  switch (action.type) {
    case "add":
      return [...state, action.account];
    case "remove":
      return state.filter((a) => a.id !== action.id);
    case "update":
      return state.map((a) =>
        a.id === action.account.id ? action.account : a,
      );
    case "set":
      return action.accounts;
  }
}

type AccountContextValue = {
  accounts: Account[];
  addAccount: (account: Account) => Promise<void>;
  removeAccount: (id: string) => Promise<void>;
  updateAccount: (account: Account) => Promise<void>;
};

const AccountContext = createContext<AccountContextValue | null>(null);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [accounts, dispatch] = useReducer(accountReducer, []);

  useEffect(() => {
    fetch("/api/accounts")
      .then((res) => res.json())
      .then((data) => dispatch({ type: "set", accounts: data }));
  }, []);

  async function addAccount(account: Account) {
    await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(account),
    });
    dispatch({ type: "add", account });
  }

  async function removeAccount(id: string) {
    await fetch(`/api/accounts/${id}`, { method: "DELETE" });
    dispatch({ type: "remove", id });
  }

  async function updateAccount(account: Account) {
    await fetch(`/api/accounts/${account.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(account),
    });
    dispatch({ type: "update", account });
  }

  return (
    <AccountContext value={{ accounts, addAccount, removeAccount, updateAccount }}>
      {children}
    </AccountContext>
  );
}

export function useAccounts(): AccountContextValue {
  const ctx = useContext(AccountContext);
  if (!ctx) {
    throw new Error("useAccounts must be used within AccountProvider");
  }
  return ctx;
}

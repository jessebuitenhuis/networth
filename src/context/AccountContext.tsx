"use client";

import { createContext, useContext, useEffect, useReducer } from "react";

import type { Account } from "@/accounts/Account.type";
import { loadAccounts, saveAccounts } from "@/services/AccountStorage";

export type AccountAction =
  | { type: "add"; account: Account }
  | { type: "remove"; id: string }
  | { type: "update"; account: Account }
  | { type: "set"; accounts: Account[] };

export function accountReducer(
  state: Account[],
  action: AccountAction
): Account[] {
  switch (action.type) {
    case "add":
      return [...state, action.account];
    case "remove":
      return state.filter((a) => a.id !== action.id);
    case "update":
      return state.map((a) =>
        a.id === action.account.id ? action.account : a
      );
    case "set":
      return action.accounts;
  }
}

type AccountContextValue = {
  accounts: Account[];
  addAccount: (account: Account) => void;
  removeAccount: (id: string) => void;
  updateAccount: (account: Account) => void;
};

const AccountContext = createContext<AccountContextValue | null>(null);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [accounts, dispatch] = useReducer(accountReducer, []);

  useEffect(() => {
    dispatch({ type: "set", accounts: loadAccounts() });
  }, []);

  useEffect(() => {
    saveAccounts(accounts);
  }, [accounts]);

  function addAccount(account: Account) {
    dispatch({ type: "add", account });
  }

  function removeAccount(id: string) {
    dispatch({ type: "remove", id });
  }

  function updateAccount(account: Account) {
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
  // AGENT: Is this check needed, is this not already handled in useContext?
  if (!ctx) {
    throw new Error("useAccounts must be used within AccountProvider");
  }
  return ctx;
}

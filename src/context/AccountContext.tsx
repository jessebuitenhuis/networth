"use client";

import { createContext, useContext, useEffect, useReducer } from "react";
import type { Account } from "@/models/Account";
import { loadAccounts, saveAccounts } from "@/services/AccountStorage";

export type AccountAction =
  | { type: "add"; account: Account }
  | { type: "remove"; id: string }
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
    case "set":
      return action.accounts;
  }
}

type AccountContextValue = {
  accounts: Account[];
  addAccount: (account: Account) => void;
  removeAccount: (id: string) => void;
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

  return (
    <AccountContext value={{ accounts, addAccount, removeAccount }}>
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

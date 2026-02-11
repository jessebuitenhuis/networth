# Context

React Context providers for global app state. Both use `useReducer` and persist to `localStorage` via services.

## Files

### `AccountContext.tsx`

- **Provider**: `AccountProvider` — wraps the app, provides `accounts`, `addAccount`, `removeAccount`
- **Hook**: `useAccounts()` — returns `{ accounts: Account[], addAccount, removeAccount }`
- **Reducer actions**: `add`, `remove`, `set`
- Loads from `localStorage` on mount, saves on every state change

### `TransactionContext.tsx`

- **Provider**: `TransactionProvider` — wraps the app, provides transactions and balance computation
- **Hook**: `useTransactions()` — returns `{ transactions, addTransaction, removeTransaction, getBalance }`
- **`getBalance(accountId)`** — memoized via `useCallback`, delegates to `computeBalance` service
- On mount: runs `migrateAccountBalances()` (one-time migration from legacy format), then loads stored transactions

## Provider Nesting (in `layout.tsx`)

```
SidebarProvider > AccountProvider > TransactionProvider > AppLayout
```

`TransactionProvider` is nested inside `AccountProvider` because it depends on account data for migration.

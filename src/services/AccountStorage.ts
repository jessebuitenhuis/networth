import type { Account } from "@/models/Account";
import type { Transaction } from "@/models/Transaction";

const STORAGE_KEY = "accounts";

export function loadAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Account[];
  } catch {
    return [];
  }
}

export function saveAccounts(accounts: Account[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

type LegacyAccount = Account & { balance?: number };

export function migrateAccountBalances(): Transaction[] {
  if (localStorage.getItem("transactions") !== null) return [];

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  let legacy: LegacyAccount[];
  try {
    legacy = JSON.parse(raw) as LegacyAccount[];
  } catch {
    return [];
  }

  const transactions: Transaction[] = [];
  const today = new Date().toISOString().split("T")[0];

  for (const account of legacy) {
    if (account.balance && account.balance !== 0) {
      transactions.push({
        id: crypto.randomUUID(),
        accountId: account.id,
        amount: account.balance,
        date: today,
        description: "Opening balance",
      });
    }
  }

  const migrated = legacy.map(({ balance: _, ...rest }) => rest);
  saveAccounts(migrated);

  return transactions;
}

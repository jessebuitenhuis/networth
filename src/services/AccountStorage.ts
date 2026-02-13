import { generateId } from "@/lib/generateId";
import type { Account } from "@/models/Account.type";
import type { Transaction } from "@/models/Transaction.type";

const STORAGE_KEY = "accounts";

export function loadAccounts(): Account[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Account[];
  } catch {
    return [];
  }
}

export function saveAccounts(accounts: Account[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

type LegacyAccount = Account & { balance?: number };

export function migrateAccountBalances(): Transaction[] {
  if (typeof window === "undefined") return [];
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
        id: generateId(),
        accountId: account.id,
        amount: account.balance,
        date: today,
        description: "Opening balance",
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const migrated = legacy.map(({ balance: _balance, ...rest }) => rest);
  saveAccounts(migrated);

  return transactions;
}

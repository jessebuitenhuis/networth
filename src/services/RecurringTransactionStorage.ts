import type { RecurringTransaction } from "@/models/RecurringTransaction.type";

const STORAGE_KEY = "recurringTransactions";

export function loadRecurringTransactions(): RecurringTransaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecurringTransaction[];
  } catch {
    return [];
  }
}

export function saveRecurringTransactions(
  transactions: RecurringTransaction[]
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

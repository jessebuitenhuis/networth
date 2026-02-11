import type { RecurringTransaction } from "@/models/RecurringTransaction";

const STORAGE_KEY = "recurringTransactions";

export function loadRecurringTransactions(): RecurringTransaction[] {
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

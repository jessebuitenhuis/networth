import type { Transaction } from "@/models/Transaction";
import { formatDate } from "@/lib/dateUtils";

export function isTransactionProjected(
  transaction: Transaction,
  today: string = formatDate(new Date())
): boolean {
  return transaction.isProjected === true || transaction.date > today;
}

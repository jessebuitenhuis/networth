import { formatDate } from "@/lib/dateUtils";
import type { Transaction } from "@/models/Transaction.type";

export function isTransactionProjected(
  transaction: Transaction,
  today: string = formatDate(new Date())
): boolean {
  return transaction.isProjected === true || transaction.date > today;
}

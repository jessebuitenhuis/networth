import { AccountType } from "@/accounts/AccountType";
import { generateOccurrences } from "@/recurring-transactions/generateOccurrences";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import type { Transaction } from "@/transactions/Transaction.type";

function classifyAmount(
  type: AccountType,
  amount: number
): { income: number; expense: number } {
  const isIncome =
    (type === AccountType.Asset && amount > 0) ||
    (type === AccountType.Liability && amount < 0);

  return isIncome
    ? { income: Math.abs(amount), expense: 0 }
    : { income: 0, expense: Math.abs(amount) };
}

export function computeIncomeAndExpenses(
  accountTypes: Map<string, AccountType>,
  transactions: Transaction[],
  recurringTransactions: RecurringTransaction[],
  today: string,
  endDate: string
): { totalIncome: number; totalExpenses: number } {
  const futureManualTransactions = transactions.filter(
    (tx) => tx.date > today && tx.date <= endDate
  );

  const futureRecurringOccurrences = recurringTransactions
    .filter((rt) => accountTypes.has(rt.accountId))
    .flatMap((rt) => generateOccurrences(rt, today, endDate))
    .filter((occ) => occ.date > today);

  const allFutureTransactions = [
    ...futureManualTransactions,
    ...futureRecurringOccurrences,
  ];

  let totalIncome = 0;
  let totalExpenses = 0;

  for (const tx of allFutureTransactions) {
    const type = accountTypes.get(tx.accountId);
    if (!type) continue;

    const { income, expense } = classifyAmount(type, tx.amount);
    totalIncome += income;
    totalExpenses += expense;
  }

  return { totalIncome, totalExpenses };
}

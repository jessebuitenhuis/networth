import type { Account } from "@/accounts/Account.type";
import { AccountType } from "@/accounts/AccountType";
import { applyInflation } from "@/charts/applyInflation";
import { generateOccurrences } from "@/recurring-transactions/generateOccurrences";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import { generateCompoundGrowthTransactions } from "@/transactions/generateCompoundGrowthTransactions";
import type { Transaction } from "@/transactions/Transaction.type";

export function collectFutureTransactions(
  transactions: Transaction[],
  accountTypes: Map<string, AccountType>,
  today: string,
  endStr: string,
  recurringTransactions: RecurringTransaction[],
  inflationRate: number,
  accounts: Account[],
  datePoints: string[]
): Transaction[] {
  const oneOff = collectFutureOneOff(transactions, accountTypes, today, endStr);
  const recurring = collectFutureRecurring(recurringTransactions, accountTypes, today, endStr, inflationRate);
  const futureTx = [...oneOff, ...recurring];
  const growth = collectCompoundGrowth(accounts, transactions, futureTx, datePoints, today);
  futureTx.push(...growth);
  return futureTx;
}

function collectFutureOneOff(
  transactions: Transaction[],
  accountTypes: Map<string, AccountType>,
  today: string,
  endStr: string
): Transaction[] {
  return transactions.filter(
    (tx) => accountTypes.has(tx.accountId) && tx.date > today && tx.date <= endStr
  );
}

function collectFutureRecurring(
  recurringTransactions: RecurringTransaction[],
  accountTypes: Map<string, AccountType>,
  today: string,
  endStr: string,
  inflationRate: number
): Transaction[] {
  const occurrences = recurringTransactions
    .filter((rt) => accountTypes.has(rt.accountId))
    .flatMap((rt) => generateOccurrences(rt, today, endStr))
    .filter((occ) => occ.date > today);

  if (inflationRate > 0) {
    for (const occ of occurrences) {
      occ.amount = applyInflation(occ.amount, today, occ.date, inflationRate);
    }
  }

  return occurrences;
}

function collectCompoundGrowth(
  accounts: Account[],
  transactions: Transaction[],
  futureTx: Transaction[],
  datePoints: string[],
  today: string
): Transaction[] {
  const futureDatePoints = datePoints.filter((d) => d > today);
  const growthTx: Transaction[] = [];

  for (const account of accounts) {
    if (account.expectedReturnRate === undefined) continue;

    const startBalance = transactions
      .filter((tx) => tx.accountId === account.id && tx.date <= today)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const accountFutureTx = futureTx
      .filter((tx) => tx.accountId === account.id)
      .sort((a, b) => a.date.localeCompare(b.date));

    growthTx.push(
      ...generateCompoundGrowthTransactions(
        account.id,
        startBalance,
        account.expectedReturnRate,
        accountFutureTx,
        futureDatePoints,
        today
      )
    );
  }

  return growthTx;
}

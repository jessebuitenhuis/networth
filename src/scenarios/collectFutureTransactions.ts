import type { Account } from "@/accounts/Account.type";
import { AccountType } from "@/accounts/AccountType";
import { generateOccurrences } from "@/recurring-transactions/generateOccurrences";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import { generateCompoundGrowthTransactions } from "@/transactions/generateCompoundGrowthTransactions";
import type { Transaction } from "@/transactions/Transaction.type";

function expandRecurringTransactions(
  recurringTransactions: RecurringTransaction[],
  accountTypes: Map<string, AccountType>,
  today: string,
  endDate: string
): Transaction[] {
  return recurringTransactions
    .filter((rt) => accountTypes.has(rt.accountId))
    .flatMap((rt) => generateOccurrences(rt, today, endDate))
    .filter((occ) => occ.date > today);
}

function calculateAccountStartBalance(
  accountId: string,
  allTransactions: Transaction[],
  today: string
): number {
  return allTransactions
    .filter((tx) => tx.accountId === accountId && tx.date <= today)
    .reduce((sum, tx) => sum + tx.amount, 0);
}

function generateGrowthTransactions(
  accounts: Account[],
  allTransactions: Transaction[],
  futureTx: Transaction[],
  datePoints: string[],
  today: string
): Transaction[] {
  const growableAccounts = accounts.filter(
    (a) => a.expectedReturnRate !== undefined
  );

  return growableAccounts.flatMap((account) => {
    const startBalance = calculateAccountStartBalance(
      account.id,
      allTransactions,
      today
    );

    const accountFutureTx = futureTx
      .filter((tx) => tx.accountId === account.id)
      .sort((a, b) => a.date.localeCompare(b.date));

    return generateCompoundGrowthTransactions(
      account.id,
      startBalance,
      account.expectedReturnRate!,
      accountFutureTx,
      datePoints,
      today
    );
  });
}

export function collectFutureTransactions(
  manualFutureTransactions: Transaction[],
  recurringTransactions: RecurringTransaction[],
  accounts: Account[],
  allTransactions: Transaction[],
  accountTypes: Map<string, AccountType>,
  datePoints: string[],
  today: string,
  endDate: string
): Transaction[] {
  const recurringOccurrences = expandRecurringTransactions(
    recurringTransactions,
    accountTypes,
    today,
    endDate
  );

  const futureTx = [...manualFutureTransactions, ...recurringOccurrences];

  const growthTx = generateGrowthTransactions(
    accounts,
    allTransactions,
    futureTx,
    datePoints,
    today
  );

  return [...futureTx, ...growthTx].sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

import type { Account } from "@/accounts/Account.type";
import { AccountType } from "@/accounts/AccountType";
import { accumulateNetWorth } from "@/charts/accumulateNetWorth";
import type { NetWorthDataPoint } from "@/charts/NetWorthDataPoint.type";
import type { Goal } from "@/goals/Goal.type";
import { addYears, endOfMonth, formatDate } from "@/lib/dateUtils";
import { generateOccurrences } from "@/recurring-transactions/generateOccurrences";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import { generateCompoundGrowthTransactions } from "@/transactions/generateCompoundGrowthTransactions";
import type { Transaction } from "@/transactions/Transaction.type";

import type { ScenarioComparisonMetrics } from "./ScenarioComparisonMetrics.type";

function generateMonthlyDatePoints(today: string, endDate: string): string[] {
  const todayDate = new Date(today + "T00:00:00");
  const dates: string[] = [today];

  for (let m = 0; m < 120; m++) {
    const eom = endOfMonth(
      new Date(todayDate.getFullYear(), todayDate.getMonth() + m, 1)
    );
    const eomStr = formatDate(eom);
    if (eomStr > endDate) break;
    if (eomStr !== dates[dates.length - 1]) {
      dates.push(eomStr);
    }
  }

  if (dates[dates.length - 1] !== endDate) {
    dates.push(endDate);
  }

  return dates;
}

// Assumes series is sorted ascending by date
function findNetWorthAtDate(
  series: NetWorthDataPoint[],
  targetDate: string
): number {
  let closest = series[0];
  for (const point of series) {
    if (point.date <= targetDate) {
      closest = point;
    } else {
      break;
    }
  }
  return closest?.netWorth ?? 0;
}

function computeIncomeAndExpenses(
  accounts: Account[],
  transactions: Transaction[],
  recurringTransactions: RecurringTransaction[],
  today: string,
  endDate: string
): { totalIncome: number; totalExpenses: number } {
  const accountTypes = new Map<string, AccountType>();
  for (const a of accounts) accountTypes.set(a.id, a.type);

  let totalIncome = 0;
  let totalExpenses = 0;

  function classifyTransaction(tx: { accountId: string; amount: number }) {
    const type = accountTypes.get(tx.accountId);
    if (!type) return;

    const isIncome =
      (type === AccountType.Asset && tx.amount > 0) ||
      (type === AccountType.Liability && tx.amount < 0);

    if (isIncome) {
      totalIncome += Math.abs(tx.amount);
    } else {
      totalExpenses += Math.abs(tx.amount);
    }
  }

  for (const tx of transactions) {
    if (tx.date > today && tx.date <= endDate) {
      classifyTransaction(tx);
    }
  }

  for (const rt of recurringTransactions) {
    if (!accountTypes.has(rt.accountId)) continue;
    const occurrences = generateOccurrences(rt, today, endDate);
    for (const occ of occurrences) {
      if (occ.date > today) {
        classifyTransaction(occ);
      }
    }
  }

  return { totalIncome, totalExpenses };
}

export function computeScenarioMetrics(
  scenarioId: string | null,
  scenarioName: string,
  accounts: Account[],
  transactions: Transaction[],
  recurringTransactions: RecurringTransaction[],
  goals: Goal[],
  today: string
): ScenarioComparisonMetrics {
  const todayDate = new Date(today + "T00:00:00");
  const endDate = formatDate(addYears(todayDate, 10));
  const datePoints = generateMonthlyDatePoints(today, endDate);

  const accountTypes = new Map<string, AccountType>();
  for (const a of accounts) accountTypes.set(a.id, a.type);

  let currentNetWorth = 0;
  const futureTx: Transaction[] = [];

  for (const tx of transactions) {
    if (!accountTypes.has(tx.accountId)) continue;
    const type = accountTypes.get(tx.accountId)!;
    if (tx.date <= today) {
      currentNetWorth += type === AccountType.Asset ? tx.amount : -tx.amount;
    } else {
      futureTx.push(tx);
    }
  }

  for (const rt of recurringTransactions) {
    if (!accountTypes.has(rt.accountId)) continue;
    const occurrences = generateOccurrences(rt, today, endDate);
    for (const occ of occurrences) {
      if (occ.date > today) {
        futureTx.push(occ);
      }
    }
  }

  for (const account of accounts) {
    if (account.expectedReturnRate === undefined) continue;

    let startBalance = 0;
    for (const tx of transactions) {
      if (tx.accountId === account.id && tx.date <= today) {
        startBalance += tx.amount;
      }
    }

    const accountFutureTx = futureTx
      .filter((tx) => tx.accountId === account.id)
      .sort((a, b) => a.date.localeCompare(b.date));

    const growthTx = generateCompoundGrowthTransactions(
      account.id,
      startBalance,
      account.expectedReturnRate,
      accountFutureTx,
      datePoints,
      today
    );

    futureTx.push(...growthTx);
  }

  futureTx.sort((a, b) => a.date.localeCompare(b.date));

  const projectedSeries = accumulateNetWorth(
    datePoints,
    futureTx,
    accountTypes,
    currentNetWorth
  );

  const date1yr = formatDate(addYears(todayDate, 1));
  const date5yr = formatDate(addYears(todayDate, 5));
  const date10yr = formatDate(addYears(todayDate, 10));

  const goalAchievements = goals.map((goal) => {
    if (goal.targetAmount <= 0) {
      return { goalId: goal.id, goalName: goal.name, achievementDate: null };
    }
    const achievementPoint = projectedSeries.find(
      (point) => point.netWorth >= goal.targetAmount
    );
    return {
      goalId: goal.id,
      goalName: goal.name,
      achievementDate: achievementPoint?.date ?? null,
    };
  });

  const { totalIncome, totalExpenses } = computeIncomeAndExpenses(
    accounts,
    transactions,
    recurringTransactions,
    today,
    endDate
  );

  return {
    scenarioId,
    scenarioName,
    projectedNetWorth1yr: findNetWorthAtDate(projectedSeries, date1yr),
    projectedNetWorth5yr: findNetWorthAtDate(projectedSeries, date5yr),
    projectedNetWorth10yr: findNetWorthAtDate(projectedSeries, date10yr),
    goalAchievements,
    totalIncome,
    totalExpenses,
  };
}

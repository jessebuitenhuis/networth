import type { Account } from "@/accounts/Account.type";
import { accumulateNetWorth } from "@/charts/accumulateNetWorth";
import type { Goal } from "@/goals/Goal.type";
import { addYears, formatDate } from "@/lib/dateUtils";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import type { Transaction } from "@/transactions/Transaction.type";

import { buildAccountTypeMap } from "./buildAccountTypeMap";
import { calculateCurrentNetWorth } from "./calculateCurrentNetWorth";
import { collectFutureTransactions } from "./collectFutureTransactions";
import { computeGoalAchievements } from "./computeGoalAchievements";
import { computeIncomeAndExpenses } from "./computeIncomeAndExpenses";
import { findClosestNetWorthAtDate } from "./findClosestNetWorthAtDate";
import { generateMonthlyDatePoints } from "./generateMonthlyDatePoints";
import type { ScenarioComparisonMetrics } from "./ScenarioComparisonMetrics.type";

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
  const accountTypes = buildAccountTypeMap(accounts);

  const { currentNetWorth, futureTransactions } = calculateCurrentNetWorth(
    transactions,
    accountTypes,
    today
  );

  const allFutureTransactions = collectFutureTransactions(
    futureTransactions,
    recurringTransactions,
    accounts,
    transactions,
    accountTypes,
    datePoints,
    today,
    endDate
  );

  const projectedSeries = accumulateNetWorth(
    datePoints,
    allFutureTransactions,
    accountTypes,
    currentNetWorth
  );

  const date1yr = formatDate(addYears(todayDate, 1));
  const date5yr = formatDate(addYears(todayDate, 5));
  const date10yr = formatDate(addYears(todayDate, 10));

  return {
    scenarioId,
    scenarioName,
    projectedNetWorth1yr: findClosestNetWorthAtDate(projectedSeries, date1yr),
    projectedNetWorth5yr: findClosestNetWorthAtDate(projectedSeries, date5yr),
    projectedNetWorth10yr: findClosestNetWorthAtDate(projectedSeries, date10yr),
    goalAchievements: computeGoalAchievements(goals, projectedSeries),
    ...computeIncomeAndExpenses(
      accountTypes,
      transactions,
      recurringTransactions,
      today,
      endDate
    ),
  };
}

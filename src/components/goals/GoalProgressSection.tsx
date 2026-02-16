"use client";

import { useMemo } from "react";

import { AccountType } from "@/accounts/AccountType";
import { useAccounts } from "@/accounts/AccountContext";
import { useRecurringTransactions } from "@/recurring-transactions/RecurringTransactionContext";
import { useScenarios } from "@/scenarios/ScenarioContext";
import { useTransactions } from "@/transactions/TransactionContext";
import { useGoals } from "@/goals/GoalContext";
import { addYears, formatDate } from "@/lib/dateUtils";
import { ChartPeriod } from "@/models/ChartPeriod";
import { computeGoalProgress } from "@/services/computeGoalProgress";
import { computeProjectedSeries } from "@/services/computeProjectedSeries";
import { filterTransactionsByScenario } from "@/services/filterTransactionsByScenario";

import { GoalProgressCard } from "./GoalProgressCard";

export function GoalProgressSection() {
  const { accounts } = useAccounts();
  const { transactions, getBalance } = useTransactions();
  const { recurringTransactions } = useRecurringTransactions();
  const { activeScenarioId } = useScenarios();
  const { goals } = useGoals();

  const progressData = useMemo(() => {
    if (goals.length === 0) return null;

    const currentNetWorth = accounts.reduce((sum, a) => {
      const balance = getBalance(a.id);
      return a.type === AccountType.Asset ? sum + balance : sum - balance;
    }, 0);

    const filteredTransactions = filterTransactionsByScenario(transactions, activeScenarioId);
    const filteredRecurringTransactions = filterTransactionsByScenario(
      recurringTransactions,
      activeScenarioId
    );

    const today = formatDate(new Date());
    const futureDate = formatDate(addYears(new Date(), 50));

    const projectedSeries = computeProjectedSeries(
      accounts,
      filteredTransactions,
      ChartPeriod.Custom,
      today,
      { start: today, end: futureDate },
      filteredRecurringTransactions
    );

    return computeGoalProgress(goals, currentNetWorth, projectedSeries, today);
  }, [accounts, transactions, recurringTransactions, activeScenarioId, goals, getBalance]);

  if (!progressData) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Goal Progress</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {progressData.map((progress, index) => (
          <GoalProgressCard key={progress.goalId} progress={progress} colorIndex={index} />
        ))}
      </div>
    </section>
  );
}

import { useMemo } from "react";

import { useAccounts } from "@/accounts/AccountContext";
import { useGoals } from "@/goals/GoalContext";
import { formatDate } from "@/lib/dateUtils";
import { useRecurringTransactions } from "@/recurring-transactions/RecurringTransactionContext";
import { computeScenarioMetrics } from "@/scenarios/computeScenarioMetrics";
import type { ScenarioComparisonMetrics } from "@/scenarios/ScenarioComparisonMetrics.type";
import { useScenarios } from "@/scenarios/ScenarioContext";
import { useTransactions } from "@/transactions/TransactionContext";

export function useScenarioMetricsColumns(
  selectedScenarioIds: Set<string>,
  excludedAccountIds: Set<string>
): ScenarioComparisonMetrics[] | null {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const { recurringTransactions } = useRecurringTransactions();
  const { scenarios } = useScenarios();
  const { goals } = useGoals();

  return useMemo(() => {
    if (selectedScenarioIds.size < 1) return null;

    const today = formatDate(new Date());
    const filteredAccounts = accounts.filter(
      (a) => !excludedAccountIds.has(a.id)
    );

    const baselineTransactions = transactions.filter((t) => !t.scenarioId);
    const baselineRecurring = recurringTransactions.filter(
      (rt) => !rt.scenarioId
    );

    const columns: ScenarioComparisonMetrics[] = [];

    columns.push(
      computeScenarioMetrics(
        null,
        "Baseline",
        filteredAccounts,
        baselineTransactions,
        baselineRecurring,
        goals,
        today
      )
    );

    for (const scenarioId of selectedScenarioIds) {
      const scenario = scenarios.find((s) => s.id === scenarioId);
      if (!scenario) continue;

      const scenarioTransactions = transactions.filter(
        (t) => !t.scenarioId || t.scenarioId === scenarioId
      );
      const scenarioRecurring = recurringTransactions.filter(
        (rt) => !rt.scenarioId || rt.scenarioId === scenarioId
      );

      columns.push(
        computeScenarioMetrics(
          scenarioId,
          scenario.name,
          filteredAccounts,
          scenarioTransactions,
          scenarioRecurring,
          goals,
          today
        )
      );
    }

    return columns;
  }, [
    accounts,
    transactions,
    recurringTransactions,
    scenarios,
    goals,
    selectedScenarioIds,
    excludedAccountIds,
  ]);
}

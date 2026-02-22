"use client";

import { useState } from "react";

import { useAccounts } from "@/accounts/AccountContext";
import { useCategories } from "@/categories/CategoryContext";
import { GanttChart } from "@/components/shared/gantt-chart/GanttChart";
import { useScenarios } from "@/scenarios/ScenarioContext";
import { ScenarioFilterSelect } from "@/scenarios/components/ScenarioFilterSelect";
import { filterTransactionsByScenario } from "@/transactions/filterTransactionsByScenario";

import { buildRecurringTransactionGanttGroups } from "../buildRecurringTransactionGanttGroups";
import { useRecurringTransactions } from "../RecurringTransactionContext";

export function RecurringTransactionTimeline() {
  const { recurringTransactions } = useRecurringTransactions();
  const { categories } = useCategories();
  const { accounts } = useAccounts();
  const { scenarios } = useScenarios();

  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  const filtered = filterTransactionsByScenario(
    recurringTransactions,
    activeScenarioId,
  );

  const groups = buildRecurringTransactionGanttGroups(
    filtered,
    categories,
    accounts,
    scenarios,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ScenarioFilterSelect
          scenarios={scenarios}
          value={activeScenarioId}
          onValueChange={setActiveScenarioId}
        />
      </div>
      {filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          No recurring transactions to display.
        </div>
      ) : (
        <GanttChart groups={groups} />
      )}
    </div>
  );
}

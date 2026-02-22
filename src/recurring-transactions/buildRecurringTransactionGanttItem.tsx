import type { Account } from "@/accounts/Account.type";
import type { Category } from "@/categories/Category.type";
import type { GanttChartItem } from "@/components/shared/gantt-chart/GanttChartItem.type";
import { formatSignedCurrency } from "@/lib/formatSignedCurrency";
import type { Scenario } from "@/scenarios/Scenario.type";

import { RecurringTransactionTooltip } from "./components/RecurringTransactionTooltip";
import { formatFrequencyLabel } from "./formatFrequencyLabel";
import type { RecurringTransaction } from "./RecurringTransaction.type";

export function buildRecurringTransactionGanttItem(
  rt: RecurringTransaction,
  categories: Category[],
  accounts: Account[],
  scenarios: Scenario[],
): GanttChartItem {
  const freqLabel = formatFrequencyLabel(rt.frequency);
  const label = `${rt.description} ${formatSignedCurrency(rt.amount)}/${freqLabel}`;

  return {
    id: rt.id,
    label,
    startDate: rt.startDate,
    endDate: rt.endDate ?? null,
    color: rt.amount >= 0 ? "green" : "red",
    dashed: !!rt.scenarioId,
    tooltipContent: (
      <RecurringTransactionTooltip
        recurringTransaction={rt}
        categories={categories}
        accounts={accounts}
        scenarios={scenarios}
      />
    ),
  };
}

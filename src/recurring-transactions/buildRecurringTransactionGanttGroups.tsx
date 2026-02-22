import type { Account } from "@/accounts/Account.type";
import type { Category } from "@/categories/Category.type";
import { getCategoryPath } from "@/categories/getCategoryPath";
import type { GanttChartGroup } from "@/components/shared/gantt-chart/GanttChartGroup.type";
import type { GanttChartItem } from "@/components/shared/gantt-chart/GanttChartItem.type";
import { formatSignedCurrency } from "@/lib/formatSignedCurrency";
import type { Scenario } from "@/scenarios/Scenario.type";

import { getRootCategory } from "./getRootCategory";
import type { RecurringTransaction } from "./RecurringTransaction.type";

const frequencyLabels: Record<string, string> = {
  Weekly: "week",
  "Bi-weekly": "2 weeks",
  Monthly: "month",
  Quarterly: "quarter",
  Yearly: "year",
};

function buildTooltipContent(
  rt: RecurringTransaction,
  categories: Category[],
  accounts: Account[],
  scenarios: Scenario[],
): React.ReactNode {
  const account = accounts.find((a) => a.id === rt.accountId);
  const categoryPath = rt.categoryId
    ? getCategoryPath(rt.categoryId, categories)
    : null;
  const scenario = rt.scenarioId
    ? scenarios.find((s) => s.id === rt.scenarioId)
    : null;
  const freqLabel = frequencyLabels[rt.frequency] ?? rt.frequency;

  const startFormatted = formatMonthYear(rt.startDate);
  const endFormatted = rt.endDate ? formatMonthYear(rt.endDate) : "Ongoing";

  return (
    <div className="space-y-1 text-left">
      <div className="font-semibold">{rt.description}</div>
      <div>
        {formatSignedCurrency(rt.amount)} / {freqLabel}
      </div>
      {categoryPath && <div>{categoryPath}</div>}
      {account && <div>{account.name}</div>}
      <div>
        {startFormatted} — {endFormatted}
      </div>
      {scenario && <div>{scenario.name}</div>}
    </div>
  );
}

function formatMonthYear(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function buildRecurringTransactionGanttGroups(
  recurringTransactions: RecurringTransaction[],
  categories: Category[],
  accounts: Account[],
  scenarios: Scenario[],
): GanttChartGroup[] {
  const groupMap = new Map<string, { label: string; items: GanttChartItem[] }>();

  for (const rt of recurringTransactions) {
    const rootCategory = rt.categoryId
      ? getRootCategory(rt.categoryId, categories)
      : null;
    const groupId = rootCategory?.id ?? "__uncategorized__";
    const groupLabel = rootCategory?.name ?? "Uncategorized";

    if (!groupMap.has(groupId)) {
      groupMap.set(groupId, { label: groupLabel, items: [] });
    }

    const freqLabel = frequencyLabels[rt.frequency] ?? rt.frequency;
    const label = `${rt.description} ${formatSignedCurrency(rt.amount)}/${freqLabel}`;

    const item: GanttChartItem = {
      id: rt.id,
      label,
      startDate: rt.startDate,
      endDate: rt.endDate ?? null,
      color: rt.amount >= 0 ? "green" : "red",
      dashed: !!rt.scenarioId,
      tooltipContent: buildTooltipContent(rt, categories, accounts, scenarios),
    };

    groupMap.get(groupId)!.items.push(item);
  }

  const groups: GanttChartGroup[] = [];
  const uncategorized = groupMap.get("__uncategorized__");
  groupMap.delete("__uncategorized__");

  const sortedEntries = [...groupMap.entries()].sort(([, a], [, b]) =>
    a.label.localeCompare(b.label),
  );

  for (const [id, { label, items }] of sortedEntries) {
    items.sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );
    groups.push({ id, label, items });
  }

  if (uncategorized) {
    uncategorized.items.sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );
    groups.push({
      id: "__uncategorized__",
      label: uncategorized.label,
      items: uncategorized.items,
    });
  }

  return groups;
}

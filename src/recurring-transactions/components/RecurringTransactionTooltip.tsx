import type { Account } from "@/accounts/Account.type";
import type { Category } from "@/categories/Category.type";
import { getCategoryPath } from "@/categories/getCategoryPath";
import { formatMonthYear } from "@/lib/formatMonthYear";
import { formatSignedCurrency } from "@/lib/formatSignedCurrency";
import type { Scenario } from "@/scenarios/Scenario.type";

import { formatFrequencyLabel } from "../formatFrequencyLabel";
import type { RecurringTransaction } from "../RecurringTransaction.type";

type RecurringTransactionTooltipProps = {
  recurringTransaction: RecurringTransaction;
  categories: Category[];
  accounts: Account[];
  scenarios: Scenario[];
};

export function RecurringTransactionTooltip({
  recurringTransaction: rt,
  categories,
  accounts,
  scenarios,
}: RecurringTransactionTooltipProps) {
  const account = accounts.find((a) => a.id === rt.accountId);
  const categoryPath = rt.categoryId
    ? getCategoryPath(rt.categoryId, categories)
    : null;
  const scenario = rt.scenarioId
    ? scenarios.find((s) => s.id === rt.scenarioId)
    : null;
  const freqLabel = formatFrequencyLabel(rt.frequency);

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

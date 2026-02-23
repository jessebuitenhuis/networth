import type { Account } from "@/accounts/Account.type";
import { buildLegendEntries } from "@/charts/buildLegendEntries";
import { ChartPeriod } from "@/charts/ChartPeriod";
import { computeChartSeries } from "@/charts/computeChartSeries";
import { computeYAxisConfig } from "@/charts/computeYAxisConfig";
import { computeYAxisDomain } from "@/charts/computeYAxisDomain";
import type { DateRange } from "@/charts/DateRange.type";
import { getTickFormat } from "@/charts/formatXAxisTick";
import { isNavigablePeriod } from "@/charts/isNavigablePeriod";
import { mergeProjectedSeries } from "@/charts/mergeProjectedSeries";
import type { NetWorthDataPoint } from "@/charts/NetWorthDataPoint.type";
import type { Goal } from "@/goals/Goal.type";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import type { Scenario } from "@/scenarios/Scenario.type";
import type { Transaction } from "@/transactions/Transaction.type";

type ProjectedChartDataInput = {
  accounts: Account[];
  transactions: Transaction[];
  recurringTransactions: RecurringTransaction[];
  scenarios: Scenario[];
  goals: Goal[];
  selectedScenarioIds: Set<string>;
  period: ChartPeriod;
  offset: number;
  today: string;
  customRange: DateRange;
};

export function useProjectedChartData(input: ProjectedChartDataInput) {
  const {
    accounts, transactions, recurringTransactions, scenarios, goals,
    selectedScenarioIds, period, offset, today, customRange,
  } = input;

  const isNavigable = isNavigablePeriod(period);
  const seriesMap = new Map<string, NetWorthDataPoint[]>();

  const baselineTx = transactions.filter((t) => !t.scenarioId);
  const baselineRt = recurringTransactions.filter((rt) => !rt.scenarioId);

  const baselineSeries = computeChartSeries(
    accounts, baselineTx, baselineRt,
    period, offset, today, customRange, isNavigable, 0
  );
  seriesMap.set("baseline", baselineSeries);

  for (const scenarioId of selectedScenarioIds) {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    const scenarioTx = transactions.filter((t) => !t.scenarioId || t.scenarioId === scenarioId);
    const scenarioRt = recurringTransactions.filter((rt) => !rt.scenarioId || rt.scenarioId === scenarioId);

    seriesMap.set(
      `scenario_${scenarioId}`,
      computeChartSeries(
        accounts, scenarioTx, scenarioRt,
        period, offset, today, customRange, isNavigable,
        scenario?.inflationRate ?? 0
      )
    );
  }

  const data = mergeProjectedSeries(seriesMap);
  const tickFormat = getTickFormat(period, baselineSeries);

  const hasTodayLine =
    isNavigable &&
    baselineSeries.length > 0 &&
    baselineSeries[0].date <= today &&
    baselineSeries[baselineSeries.length - 1].date >= today;

  const [minValue, maxValue] = computeYAxisDomain(data, goals);

  return {
    data,
    tickFormat,
    hasTodayLine,
    isNavigable,
    yAxisConfig: computeYAxisConfig(minValue, maxValue),
    legendEntries: buildLegendEntries(selectedScenarioIds, scenarios, goals),
  };
}

import type { Account } from "@/accounts/Account.type";
import { getGoalColor, getScenarioColor } from "@/charts/chartColors";
import { ChartPeriod } from "@/charts/ChartPeriod";
import { computePlanningChartSeries } from "@/charts/computePlanningChartSeries";
import { computeProjectedSeries } from "@/charts/computeProjectedSeries";
import { computeYAxisConfig } from "@/charts/computeYAxisConfig";
import type { DateRange } from "@/charts/DateRange.type";
import { getTickFormat } from "@/charts/formatXAxisTick";
import { mergeProjectedSeries } from "@/charts/mergeProjectedSeries";
import type { NetWorthDataPoint } from "@/charts/NetWorthDataPoint.type";
import type { Goal } from "@/goals/Goal.type";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import type { Scenario } from "@/scenarios/Scenario.type";
import type { Transaction } from "@/transactions/Transaction.type";

const NAVIGABLE_PERIODS = new Set([
  ChartPeriod.OneWeek,
  ChartPeriod.OneMonth,
  ChartPeriod.ThreeMonths,
  ChartPeriod.SixMonths,
  ChartPeriod.OneYear,
]);

export function isNavigablePeriod(period: ChartPeriod): boolean {
  return NAVIGABLE_PERIODS.has(period);
}

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

function computeSeries(
  accounts: Account[],
  transactions: Transaction[],
  recurringTransactions: RecurringTransaction[],
  period: ChartPeriod,
  offset: number,
  today: string,
  customRange: DateRange,
  isNavigable: boolean,
  inflationRate: number
): NetWorthDataPoint[] {
  if (isNavigable) {
    return computePlanningChartSeries(
      accounts, transactions, period, offset, today,
      recurringTransactions, inflationRate
    );
  }
  return computeProjectedSeries(
    accounts, transactions, period, today,
    period === ChartPeriod.Custom ? customRange : undefined,
    recurringTransactions, inflationRate
  );
}

function buildLegendEntries(
  selectedScenarioIds: Set<string>,
  scenarios: Scenario[],
  goals: Goal[]
) {
  return [
    { name: "Baseline", color: "var(--color-primary)", lineStyle: "solid" as const },
    ...Array.from(selectedScenarioIds).map((scenarioId) => {
      const scenario = scenarios.find((s) => s.id === scenarioId);
      const scenarioIndex = scenarios.findIndex((s) => s.id === scenarioId);
      return {
        name: scenario?.name || scenarioId,
        color: getScenarioColor(scenarioIndex),
        lineStyle: "dashed" as const,
      };
    }),
    ...goals.map((goal, i) => ({
      name: goal.name,
      color: getGoalColor(i),
      lineStyle: "dotted" as const,
    })),
  ];
}

function computeYAxisDomain(
  data: Record<string, unknown>[],
  goals: Goal[]
): [number, number] {
  const maxGoalAmount = goals.length > 0 ? Math.max(...goals.map((g) => g.targetAmount)) : 0;
  const maxDataValue = data.reduce((max, point) => {
    const values = Object.values(point).filter((v) => typeof v === "number");
    return Math.max(max, ...values);
  }, 0);
  const minDataValue = data.reduce((min, point) => {
    const values = Object.values(point).filter((v) => typeof v === "number");
    return Math.min(min, ...values);
  }, 0);
  return [Math.min(0, minDataValue), Math.max(maxDataValue, maxGoalAmount)];
}

export function useProjectedChartData(input: ProjectedChartDataInput) {
  const {
    accounts, transactions, recurringTransactions, scenarios, goals,
    selectedScenarioIds, period, offset, today, customRange,
  } = input;

  const isNavigable = isNavigablePeriod(period);
  const seriesMap = new Map<string, NetWorthDataPoint[]>();

  const baselineTransactions = transactions.filter((t) => !t.scenarioId);
  const baselineRecurring = recurringTransactions.filter((rt) => !rt.scenarioId);

  const baselineSeries = computeSeries(
    accounts, baselineTransactions, baselineRecurring,
    period, offset, today, customRange, isNavigable, 0
  );
  seriesMap.set("baseline", baselineSeries);

  for (const scenarioId of selectedScenarioIds) {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    const scenarioTx = transactions.filter((t) => !t.scenarioId || t.scenarioId === scenarioId);
    const scenarioRt = recurringTransactions.filter((rt) => !rt.scenarioId || rt.scenarioId === scenarioId);

    seriesMap.set(
      `scenario_${scenarioId}`,
      computeSeries(
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

import { formatTick, getTickFormat } from "@/charts/formatXAxisTick";
import { getBrowserLocale, getDefaultCurrency } from "@/lib/getLocale";

export function formatChartCurrency(value: number): string {
  return value.toLocaleString(getBrowserLocale(), {
    style: "currency",
    currency: getDefaultCurrency(),
    maximumFractionDigits: 0,
  });
}

export function formatXAxisTick(
  value: string,
  tickFormat: ReturnType<typeof getTickFormat>,
): string {
  return formatTick(value, tickFormat);
}

export function formatYAxisValue(value: number): string {
  return formatChartCurrency(value);
}

export function formatTooltipLabel(
  value: string,
  tickFormat: ReturnType<typeof getTickFormat>,
): string {
  return formatTick(value, tickFormat);
}

export function formatTooltipValue(value: number): string {
  return formatChartCurrency(value);
}

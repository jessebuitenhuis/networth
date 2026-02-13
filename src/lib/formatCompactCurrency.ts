import { getDefaultCurrency } from "./getLocale";

export function formatCompactCurrency(amount: number): string {
  const formatted = Math.abs(amount).toLocaleString(undefined, {
    style: "currency",
    currency: getDefaultCurrency(),
    notation: "compact",
    maximumFractionDigits: 1,
  });
  return amount < 0 ? `-${formatted}` : formatted;
}

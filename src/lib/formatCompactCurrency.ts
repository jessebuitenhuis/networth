import { getBrowserLocale, getDefaultCurrency } from "./getLocale";

export function formatCompactCurrency(amount: number): string {
  const formatted = Math.abs(amount).toLocaleString(getBrowserLocale(), {
    style: "currency",
    currency: getDefaultCurrency(),
    notation: "compact",
    maximumFractionDigits: 1,
    trailingZeroDisplay: "stripIfInteger",
  });
  return amount < 0 ? `-${formatted}` : formatted;
}

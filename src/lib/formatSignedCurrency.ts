import { getBrowserLocale, getDefaultCurrency } from "./getLocale";

export function formatSignedCurrency(amount: number): string {
  const formatted = Math.abs(amount).toLocaleString(getBrowserLocale(), {
    style: "currency",
    currency: getDefaultCurrency(),
  });
  return amount >= 0 ? `+${formatted}` : `-${formatted}`;
}

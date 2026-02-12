import { getDefaultCurrency } from "./getLocale";

export function formatSignedCurrency(amount: number): string {
  const formatted = Math.abs(amount).toLocaleString(undefined, {
    style: "currency",
    currency: getDefaultCurrency(),
  });
  return amount >= 0 ? `+${formatted}` : `-${formatted}`;
}

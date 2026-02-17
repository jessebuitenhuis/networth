import { getBrowserLocale, getDefaultCurrency } from "./getLocale";

export function formatCurrency(amount: number): string {
  const formatted = Math.abs(amount).toLocaleString(getBrowserLocale(), {
    style: "currency",
    currency: getDefaultCurrency(),
  });
  return amount < 0 ? `-${formatted}` : formatted;
}

// a comment that should be committed for the test

export function getBrowserLocale(): string | undefined {
  if (typeof navigator !== "undefined") {
    return navigator.language;
  }
  return undefined;
}

export function getDefaultCurrency(): string {
  const locale = getBrowserLocale() || "en-US";

  // Map common locales to currencies
  if (locale.startsWith("en-US") || locale.startsWith("en-CA")) return "USD";
  if (locale.startsWith("en-GB")) return "GBP";
  if (locale.startsWith("ja")) return "JPY";
  if (locale.startsWith("zh-CN")) return "CNY";

  // Default to EUR for European locales
  return "EUR";
}

export function getCurrencySymbol(): string {
  const locale = getBrowserLocale();
  const currency = getDefaultCurrency();

  const parts = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).formatToParts(0);

  const symbolPart = parts.find((part) => part.type === "currency");
  return symbolPart?.value ?? currency;
}

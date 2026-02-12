function getBrowserLocale(): string | undefined {
  if (typeof navigator !== "undefined" && navigator.language) {
    return navigator.language;
  }
  return undefined;
}

export function getDecimalSeparator(): string {
  const locale = getBrowserLocale();
  const parts = new Intl.NumberFormat(locale).formatToParts(1.1);
  const decimalPart = parts.find((part) => part.type === "decimal");
  return decimalPart?.value ?? ".";
}

export function getGroupingSeparator(): string {
  const locale = getBrowserLocale();
  const parts = new Intl.NumberFormat(locale).formatToParts(1000);
  const groupPart = parts.find((part) => part.type === "group");
  return groupPart?.value ?? "";
}

export function formatLocaleNumber(
  value: number,
  minimumFractionDigits?: number
): string {
  const locale = getBrowserLocale();
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits: minimumFractionDigits ?? 20,
  }).format(value);
}

export function parseLocaleNumber(formatted: string): number {
  if (!formatted || formatted.trim() === "") {
    return 0;
  }

  const groupingSep = getGroupingSeparator();
  const decimalSep = getDecimalSeparator();

  let normalized = formatted;

  if (groupingSep) {
    normalized = normalized.replace(new RegExp(`\\${groupingSep}`, "g"), "");
  }

  if (decimalSep !== ".") {
    normalized = normalized.replace(decimalSep, ".");
  }

  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

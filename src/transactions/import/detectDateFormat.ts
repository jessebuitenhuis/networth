import { DateFormat } from "./DateFormat";

const LOCALE_FORMAT_MAP: Record<string, DateFormat> = {
  "en-US": DateFormat.MM_DD_YYYY,
  "en-CA": DateFormat.YYYY_MM_DD,
  "en-GB": DateFormat.DD_MM_YYYY,
  "en-AU": DateFormat.DD_MM_YYYY,
  "en-NZ": DateFormat.DD_MM_YYYY,
  "nl": DateFormat.DD_MM_YYYY_DASH,
  "nl-NL": DateFormat.DD_MM_YYYY_DASH,
  "nl-BE": DateFormat.DD_MM_YYYY,
  "de": DateFormat.DD_MM_YYYY,
  "de-DE": DateFormat.DD_MM_YYYY,
  "de-AT": DateFormat.DD_MM_YYYY,
  "de-CH": DateFormat.DD_MM_YYYY,
  "fr": DateFormat.DD_MM_YYYY,
  "fr-FR": DateFormat.DD_MM_YYYY,
  "es": DateFormat.DD_MM_YYYY,
  "es-ES": DateFormat.DD_MM_YYYY,
  "it": DateFormat.DD_MM_YYYY,
  "it-IT": DateFormat.DD_MM_YYYY,
  "pt": DateFormat.DD_MM_YYYY,
  "pt-BR": DateFormat.DD_MM_YYYY,
  "ja": DateFormat.YYYY_MM_DD,
  "ja-JP": DateFormat.YYYY_MM_DD,
  "zh": DateFormat.YYYY_MM_DD,
  "zh-CN": DateFormat.YYYY_MM_DD,
  "ko": DateFormat.YYYY_MM_DD,
  "ko-KR": DateFormat.YYYY_MM_DD,
};

const DATE_FORMAT_PATTERNS: Record<string, RegExp> = {
  [DateFormat.YYYY_MM_DD]: /^\d{4}-\d{2}-\d{2}$/,
  [DateFormat.MM_DD_YYYY]: /^\d{2}\/\d{2}\/\d{4}$/,
  [DateFormat.DD_MM_YYYY]: /^\d{2}\/\d{2}\/\d{4}$/,
  [DateFormat.MM_DD_YYYY_DASH]: /^\d{2}-\d{2}-\d{4}$/,
  [DateFormat.DD_MM_YYYY_DASH]: /^\d{2}-\d{2}-\d{4}$/,
};

export function detectLocaleDateFormat(): DateFormat {
  if (typeof navigator === "undefined") return DateFormat.YYYY_MM_DD;

  const locale = navigator.language;
  return LOCALE_FORMAT_MAP[locale]
    ?? LOCALE_FORMAT_MAP[locale.split("-")[0]]
    ?? DateFormat.YYYY_MM_DD;
}

export function detectDateFormatFromData(
  dataRows: string[][],
  dateColumn: number,
  localeDefault: DateFormat,
): DateFormat {
  if (dateColumn < 0 || dataRows.length === 0) return localeDefault;

  const sampleDates = dataRows
    .slice(0, 5)
    .map((row) => row[dateColumn]?.trim())
    .filter(Boolean);

  if (sampleDates.length === 0) return localeDefault;

  const localeMatches = _countMatches(sampleDates, localeDefault);
  if (localeMatches === sampleDates.length) return localeDefault;

  let bestFormat = localeDefault;
  let bestCount = localeMatches;

  for (const format of Object.values(DateFormat)) {
    const count = _countMatches(sampleDates, format);
    if (count > bestCount) {
      bestCount = count;
      bestFormat = format;
    }
  }

  return bestFormat;
}

function _countMatches(dates: string[], format: DateFormat): number {
  const pattern = DATE_FORMAT_PATTERNS[format];
  return dates.filter((d) => pattern.test(d)).length;
}

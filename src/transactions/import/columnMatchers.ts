import type { CsvColumnMapping } from "./CsvColumnMapping.type";

interface ColumnMatcher {
  patterns: string[];
  field: keyof CsvColumnMapping;
}

const COLUMN_MATCHERS: ColumnMatcher[] = [
  { patterns: ["date", "transaction date", "timestamp"], field: "dateColumn" },
  { patterns: ["amount", "value", "price", "debit", "credit"], field: "amountColumn" },
  { patterns: ["description", "memo", "note", "details", "narrative"], field: "descriptionColumn" },
];

export function autoDetectColumns(headers: string[]): CsvColumnMapping {
  const mapping: CsvColumnMapping = {
    dateColumn: -1,
    amountColumn: -1,
    descriptionColumn: -1,
  };

  headers.forEach((header, index) => {
    const lower = header.toLowerCase().trim();
    for (const matcher of COLUMN_MATCHERS) {
      if (mapping[matcher.field] === -1 && matcher.patterns.includes(lower)) {
        mapping[matcher.field] = index;
        break;
      }
    }
  });

  return mapping;
}

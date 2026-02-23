import type { CsvColumnMapping } from "./CsvColumnMapping.type";

interface ColumnMatcher {
  patterns: string[];
  field: keyof CsvColumnMapping;
}

const COLUMN_MATCHERS: ColumnMatcher[] = [
  {
    patterns: [
      "date", "transaction date", "timestamp",
      "datum", "boekdatum", "transactiedatum",           // Dutch
      "buchungstag", "buchungsdatum", "valutadatum",     // German
      "fecha",                                            // Spanish
      "data",                                             // Italian/Portuguese
    ],
    field: "dateColumn",
  },
  {
    patterns: [
      "amount", "value", "price", "debit", "credit",
      "bedrag", "af", "bij",                              // Dutch
      "betrag", "umsatz", "soll", "haben",                // German
      "monto", "importe",                                  // Spanish
      "importo",                                           // Italian
      "valor",                                             // Portuguese
    ],
    field: "amountColumn",
  },
  {
    patterns: [
      "description", "memo", "note", "details", "narrative",
      "omschrijving", "naam / omschrijving", "mededelingen", // Dutch
      "beschreibung", "verwendungszweck", "buchungstext",    // German
      "descripción", "concepto",                              // Spanish
      "descrizione",                                          // Italian
      "descrição",                                            // Portuguese
    ],
    field: "descriptionColumn",
  },
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

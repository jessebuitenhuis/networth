import { describe, expect, it } from "vitest";

import { parseCsvText } from "./parseCsvText";

describe("parseCsvText", () => {
  it("parses simple CSV with header and data rows", () => {
    const csv = "Date,Amount,Description\n2024-01-15,100.00,Groceries\n2024-01-16,-50.00,Gas";
    const result = parseCsvText(csv);

    expect(result).toEqual([
      ["Date", "Amount", "Description"],
      ["2024-01-15", "100.00", "Groceries"],
      ["2024-01-16", "-50.00", "Gas"],
    ]);
  });

  it("handles quoted fields containing commas", () => {
    const csv = 'Date,Amount,Description\n2024-01-15,100.00,"Groceries, fresh produce"';
    const result = parseCsvText(csv);

    expect(result).toEqual([
      ["Date", "Amount", "Description"],
      ["2024-01-15", "100.00", "Groceries, fresh produce"],
    ]);
  });

  it("handles escaped quotes inside quoted fields", () => {
    const csv = 'Date,Amount,Description\n2024-01-15,100.00,"She said ""hello"""';
    const result = parseCsvText(csv);

    expect(result).toEqual([
      ["Date", "Amount", "Description"],
      ["2024-01-15", "100.00", 'She said "hello"'],
    ]);
  });

  it("handles Windows line endings (CRLF)", () => {
    const csv = "Date,Amount,Description\r\n2024-01-15,100.00,Groceries\r\n2024-01-16,-50.00,Gas";
    const result = parseCsvText(csv);

    expect(result).toEqual([
      ["Date", "Amount", "Description"],
      ["2024-01-15", "100.00", "Groceries"],
      ["2024-01-16", "-50.00", "Gas"],
    ]);
  });

  it("strips UTF-8 BOM", () => {
    const csv = "\uFEFFDate,Amount,Description\n2024-01-15,100.00,Groceries";
    const result = parseCsvText(csv);

    expect(result).toEqual([
      ["Date", "Amount", "Description"],
      ["2024-01-15", "100.00", "Groceries"],
    ]);
  });

  it("returns empty array for empty string", () => {
    const result = parseCsvText("");
    expect(result).toEqual([]);
  });

  it("parses header-only CSV", () => {
    const csv = "Date,Amount,Description";
    const result = parseCsvText(csv);

    expect(result).toEqual([
      ["Date", "Amount", "Description"],
    ]);
  });

  it("handles trailing newline without creating extra empty row", () => {
    const csv = "Date,Amount,Description\n2024-01-15,100.00,Groceries\n";
    const result = parseCsvText(csv);

    expect(result).toEqual([
      ["Date", "Amount", "Description"],
      ["2024-01-15", "100.00", "Groceries"],
    ]);
  });
});

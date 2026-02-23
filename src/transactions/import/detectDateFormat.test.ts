import { afterEach, describe, expect, it, vi } from "vitest";

import { DateFormat } from "./DateFormat";
import {
  detectDateFormatFromData,
  detectLocaleDateFormat,
} from "./detectDateFormat";

describe("detectLocaleDateFormat", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns MM/DD/YYYY for en-US locale", () => {
    vi.stubGlobal("navigator", { language: "en-US" });
    expect(detectLocaleDateFormat()).toBe(DateFormat.MM_DD_YYYY);
  });

  it("returns DD/MM/YYYY for en-GB locale", () => {
    vi.stubGlobal("navigator", { language: "en-GB" });
    expect(detectLocaleDateFormat()).toBe(DateFormat.DD_MM_YYYY);
  });

  it("returns DD-MM-YYYY for nl-NL locale", () => {
    vi.stubGlobal("navigator", { language: "nl-NL" });
    expect(detectLocaleDateFormat()).toBe(DateFormat.DD_MM_YYYY_DASH);
  });

  it("returns DD/MM/YYYY for de-DE locale", () => {
    vi.stubGlobal("navigator", { language: "de-DE" });
    expect(detectLocaleDateFormat()).toBe(DateFormat.DD_MM_YYYY);
  });

  it("returns YYYY-MM-DD for ja-JP locale", () => {
    vi.stubGlobal("navigator", { language: "ja-JP" });
    expect(detectLocaleDateFormat()).toBe(DateFormat.YYYY_MM_DD);
  });

  it("falls back to language-only match when region not found", () => {
    vi.stubGlobal("navigator", { language: "de-CH" });
    expect(detectLocaleDateFormat()).toBe(DateFormat.DD_MM_YYYY);
  });

  it("returns YYYY-MM-DD for unknown locale", () => {
    vi.stubGlobal("navigator", { language: "xx-XX" });
    expect(detectLocaleDateFormat()).toBe(DateFormat.YYYY_MM_DD);
  });
});

describe("detectDateFormatFromData", () => {
  it("returns locale default when it matches sample data", () => {
    const rows = [["01/15/2024", "100", "Test"]];
    expect(
      detectDateFormatFromData(rows, 0, DateFormat.MM_DD_YYYY),
    ).toBe(DateFormat.MM_DD_YYYY);
  });

  it("overrides locale default when data doesn't match", () => {
    const rows = [["2024-01-15", "100", "Test"]];
    expect(
      detectDateFormatFromData(rows, 0, DateFormat.MM_DD_YYYY),
    ).toBe(DateFormat.YYYY_MM_DD);
  });

  it("returns locale default when dateColumn is -1", () => {
    const rows = [["2024-01-15", "100", "Test"]];
    expect(
      detectDateFormatFromData(rows, -1, DateFormat.MM_DD_YYYY),
    ).toBe(DateFormat.MM_DD_YYYY);
  });

  it("returns locale default when no data rows", () => {
    expect(
      detectDateFormatFromData([], 0, DateFormat.MM_DD_YYYY),
    ).toBe(DateFormat.MM_DD_YYYY);
  });

  it("validates against multiple sample rows", () => {
    const rows = [
      ["2024-01-15", "100", "Test"],
      ["2024-02-20", "200", "Test"],
      ["2024-03-25", "300", "Test"],
    ];
    expect(
      detectDateFormatFromData(rows, 0, DateFormat.MM_DD_YYYY),
    ).toBe(DateFormat.YYYY_MM_DD);
  });

  it("picks dash-separated format for dash-separated dates", () => {
    const rows = [["01-15-2024", "100", "Test"]];
    expect(
      detectDateFormatFromData(rows, 0, DateFormat.YYYY_MM_DD),
    ).toBe(DateFormat.MM_DD_YYYY_DASH);
  });

  it("returns locale default when no format matches", () => {
    const rows = [["Jan 15 2024", "100", "Test"]];
    expect(
      detectDateFormatFromData(rows, 0, DateFormat.YYYY_MM_DD),
    ).toBe(DateFormat.YYYY_MM_DD);
  });
});

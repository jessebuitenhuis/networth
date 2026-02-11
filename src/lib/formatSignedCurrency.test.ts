import { describe, expect, it } from "vitest";
import { formatSignedCurrency } from "./formatSignedCurrency";

describe("formatSignedCurrency", () => {
  it("formats zero with plus sign", () => {
    expect(formatSignedCurrency(0)).toBe("+$0.00");
  });

  it("formats positive amounts with plus sign", () => {
    expect(formatSignedCurrency(1000)).toBe("+$1,000.00");
  });

  it("formats negative amounts with minus sign", () => {
    expect(formatSignedCurrency(-200)).toBe("-$200.00");
  });

  it("formats cents", () => {
    expect(formatSignedCurrency(9.99)).toBe("+$9.99");
  });
});

import { describe, expect, it } from "vitest";
import { formatCurrency } from "./formatCurrency";

describe("formatCurrency", () => {
  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("formats positive amounts", () => {
    expect(formatCurrency(1500)).toBe("$1,500.00");
  });

  it("formats negative amounts with leading minus", () => {
    expect(formatCurrency(-1500)).toBe("-$1,500.00");
  });

  it("formats cents", () => {
    expect(formatCurrency(9.99)).toBe("$9.99");
  });
});

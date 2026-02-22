import { describe, expect, it } from "vitest";

import { applyInflation } from "./applyInflation";

describe("applyInflation", () => {
  it("returns original amount when rate is 0", () => {
    expect(applyInflation(1000, "2024-01-01", "2025-01-01", 0)).toBe(1000);
  });

  it("returns original amount for today's date", () => {
    expect(applyInflation(1000, "2024-06-15", "2024-06-15", 3)).toBe(1000);
  });

  it("applies correct compound inflation for exactly 1 year", () => {
    const result = applyInflation(1000, "2024-01-01", "2025-01-01", 3);
    // 1000 * (1.03)^1 = 1030
    expect(result).toBeCloseTo(1030, 0);
  });

  it("applies correct compound inflation for 2 years", () => {
    const result = applyInflation(1000, "2024-01-01", "2026-01-01", 3);
    // 1000 * (1.03)^2 = 1060.9
    expect(result).toBeCloseTo(1060.9, 0);
  });

  it("applies correct compound inflation for partial year (6 months)", () => {
    const result = applyInflation(1000, "2024-01-01", "2024-07-01", 3);
    // ~182 days / 365 ≈ 0.4986 years
    // 1000 * (1.03)^0.4986 ≈ 1014.9
    expect(result).toBeGreaterThan(1000);
    expect(result).toBeLessThan(1030);
  });

  it("handles negative amounts (expenses)", () => {
    const result = applyInflation(-2000, "2024-01-01", "2025-01-01", 3);
    // -2000 * (1.03)^1 = -2060
    expect(result).toBeCloseTo(-2060, 0);
  });

  it("handles large inflation rates", () => {
    const result = applyInflation(1000, "2024-01-01", "2025-01-01", 10);
    // 1000 * (1.10)^1 = 1100
    expect(result).toBeCloseTo(1100, 0);
  });
});

import { describe, expect, it } from "vitest";

import { computeYAxisConfig } from "./computeYAxisConfig";

describe("computeYAxisConfig", () => {
  describe("zero line always visible", () => {
    it("includes zero in domain when all values are positive", () => {
      const config = computeYAxisConfig(500, 2000);

      expect(config.domain[0]).toBe(0);
      expect(config.domain[1]).toBeGreaterThanOrEqual(2000);
    });

    it("includes zero in domain when all values are negative", () => {
      const config = computeYAxisConfig(-3000, -500);

      expect(config.domain[0]).toBeLessThanOrEqual(-3000);
      expect(config.domain[1]).toBeGreaterThanOrEqual(0);
    });

    it("includes zero in domain when values span zero", () => {
      const config = computeYAxisConfig(-500, 2000);

      expect(config.domain[0]).toBeLessThan(0);
      expect(config.domain[1]).toBeGreaterThan(0);
    });

    it("includes zero in ticks", () => {
      const config = computeYAxisConfig(500, 2000);

      expect(config.ticks).toContain(0);
    });
  });

  describe("centered zero line for negative values", () => {
    it("centers zero when values are mixed positive and negative", () => {
      const config = computeYAxisConfig(-500, 2000);

      expect(Math.abs(config.domain[0])).toBe(config.domain[1]);
    });

    it("centers zero when values are all negative", () => {
      const config = computeYAxisConfig(-3000, -500);

      expect(Math.abs(config.domain[0])).toBe(config.domain[1]);
    });

    it("does not center when all values are positive", () => {
      const config = computeYAxisConfig(100, 2000);

      expect(config.domain[0]).toBe(0);
    });
  });

  describe("rounded Y-axis tick values", () => {
    it("rounds domain bounds to nice numbers", () => {
      const config = computeYAxisConfig(0, 338);

      expect(config.domain[1] % 50).toBe(0);
    });

    it("rounds negative domain bounds to nice numbers", () => {
      const config = computeYAxisConfig(-338, 1000);

      expect(config.domain[0] % 50 === 0).toBe(true);
      expect(config.domain[1] % 50 === 0).toBe(true);
    });

    it("all ticks are integers", () => {
      const config = computeYAxisConfig(-338, 1500);

      for (const tick of config.ticks) {
        expect(Number.isInteger(tick)).toBe(true);
      }
    });

    it.each([
      { min: 0, max: 338, expectedMax: 350 },
      { min: 0, max: 400, expectedMax: 400 },
      { min: 0, max: 950, expectedMax: 1000 },
      { min: 0, max: 4500, expectedMax: 5000 },
      { min: 0, max: 12000, expectedMax: 12000 },
      { min: 0, max: 17000, expectedMax: 20000 },
      { min: 0, max: 98000, expectedMax: 100000 },
    ])("rounds max $max up to $expectedMax", ({ min, max, expectedMax }) => {
      const config = computeYAxisConfig(min, max);

      expect(config.domain[1]).toBe(expectedMax);
    });
  });

  describe("edge cases", () => {
    it("handles all-zero data", () => {
      const config = computeYAxisConfig(0, 0);

      expect(config.domain[0]).toBeLessThan(0);
      expect(config.domain[1]).toBeGreaterThan(0);
      expect(config.ticks).toContain(0);
    });

    it("returns at least 3 ticks", () => {
      const config = computeYAxisConfig(0, 1000);

      expect(config.ticks.length).toBeGreaterThanOrEqual(3);
    });

    it("returns ticks in ascending order", () => {
      const config = computeYAxisConfig(-500, 2000);

      for (let i = 1; i < config.ticks.length; i++) {
        expect(config.ticks[i]).toBeGreaterThan(config.ticks[i - 1]);
      }
    });

    it("ticks span the domain", () => {
      const config = computeYAxisConfig(-200, 800);

      expect(config.ticks[0]).toBe(config.domain[0]);
      expect(config.ticks[config.ticks.length - 1]).toBe(config.domain[1]);
    });

    it("handles very small values", () => {
      const config = computeYAxisConfig(0, 5);

      expect(config.domain[1]).toBeGreaterThanOrEqual(5);
      expect(config.ticks).toContain(0);
    });

    it("handles very large values", () => {
      const config = computeYAxisConfig(0, 1000000);

      expect(config.domain[1]).toBeGreaterThanOrEqual(1000000);
      expect(config.ticks).toContain(0);
    });
  });
});

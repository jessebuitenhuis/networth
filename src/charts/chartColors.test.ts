import { describe, expect, it } from "vitest";

import {
  CHART_COLORS,
  getAccountColor,
  getGoalColor,
  getScenarioColor,
} from "./chartColors";

describe("chartColors", () => {
  it("has 10 predefined colors", () => {
    expect(CHART_COLORS).toHaveLength(10);
  });

  it("returns the color at the given index", () => {
    expect(getAccountColor(0)).toBe(CHART_COLORS[0]);
    expect(getAccountColor(1)).toBe(CHART_COLORS[1]);
    expect(getAccountColor(9)).toBe(CHART_COLORS[9]);
  });

  it("wraps around using modulo for indices >= 10", () => {
    expect(getAccountColor(10)).toBe(CHART_COLORS[0]);
    expect(getAccountColor(11)).toBe(CHART_COLORS[1]);
    expect(getAccountColor(23)).toBe(CHART_COLORS[3]);
  });

  it("getScenarioColor returns expected color for index 0", () => {
    expect(getScenarioColor(0)).toBe(CHART_COLORS[0]);
  });

  it("getScenarioColor wraps around at palette length", () => {
    expect(getScenarioColor(10)).toBe(CHART_COLORS[0]);
    expect(getScenarioColor(11)).toBe(CHART_COLORS[1]);
  });

  describe("getGoalColor", () => {
    it("returns a color string for index 0", () => {
      const color = getGoalColor(0);
      expect(typeof color).toBe("string");
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it("wraps around when index exceeds array length", () => {
      const color0 = getGoalColor(0);
      const color4 = getGoalColor(4);
      const color8 = getGoalColor(8);

      expect(color4).toBe(color0);
      expect(color8).toBe(color0);
    });
  });
});

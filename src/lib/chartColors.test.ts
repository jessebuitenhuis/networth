import { describe, expect, it } from "vitest";

import { CHART_COLORS, getAccountColor } from "./chartColors";

describe("chartColors", () => {
  it("has 10 predefined colors", () => {
    expect(CHART_COLORS).toHaveLength(10);
  });

  it.each([
    [0, 0],
    [1, 1],
    [9, 9],
    [10, 0],
    [11, 1],
    [23, 3],
  ])("getAccountColor(%i) returns CHART_COLORS[%i]", (index, expectedIdx) => {
    expect(getAccountColor(index)).toBe(CHART_COLORS[expectedIdx]);
  });
});

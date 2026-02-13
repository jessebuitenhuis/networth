import { describe, expect, it } from "vitest";

import { formatCompactCurrency } from "./formatCompactCurrency";

describe("formatCompactCurrency", () => {
  it.each([
    [0, "US$0"],
    [450, "US$450"],
    [999, "US$999"],
    [1000, "US$1K"],
    [1500, "US$1.5K"],
    [12345, "US$12.3K"],
    [250000, "US$250K"],
    [1000000, "US$1M"],
    [2300000, "US$2.3M"],
    [-500, "-US$500"],
    [-150000, "-US$150K"],
  ])("formats %d as %s", (amount, expected) => {
    expect(formatCompactCurrency(amount)).toBe(expected);
  });
});

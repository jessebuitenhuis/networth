import { describe, expect, it } from "vitest";

import { formatCompactCurrency } from "./formatCompactCurrency";

describe("formatCompactCurrency", () => {
  it.each([
    [0, "$0"],
    [450, "$450"],
    [999, "$999"],
    [1000, "$1K"],
    [1500, "$1.5K"],
    [12345, "$12.3K"],
    [250000, "$250K"],
    [1000000, "$1M"],
    [2300000, "$2.3M"],
    [-500, "-$500"],
    [-150000, "-$150K"],
  ])("formats %d as %s", (amount, expected) => {
    expect(formatCompactCurrency(amount)).toBe(expected);
  });
});

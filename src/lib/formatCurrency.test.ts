import { describe, expect, it } from "vitest";

import { formatCurrency } from "./formatCurrency";

describe("formatCurrency", () => {
  it.each([
    [0, "$0.00"],
    [1500, "$1,500.00"],
    [-1500, "-$1,500.00"],
    [9.99, "$9.99"],
  ])("formats %s as %s", (input, expected) => {
    expect(formatCurrency(input)).toBe(expected);
  });
});

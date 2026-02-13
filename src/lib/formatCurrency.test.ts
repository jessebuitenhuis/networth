import { describe, expect, it } from "vitest";

import { formatCurrency } from "./formatCurrency";

describe("formatCurrency", () => {
  it.each([
    [0, "US$0.00"],
    [1500, "US$1,500.00"],
    [-1500, "-US$1,500.00"],
    [9.99, "US$9.99"],
  ])("formats %s as %s", (input, expected) => {
    expect(formatCurrency(input)).toBe(expected);
  });
});

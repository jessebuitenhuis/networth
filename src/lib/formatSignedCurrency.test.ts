import { describe, expect, it } from "vitest";

import { formatSignedCurrency } from "./formatSignedCurrency";

describe("formatSignedCurrency", () => {
  it.each([
    [0, "+$0.00"],
    [1000, "+$1,000.00"],
    [-200, "-$200.00"],
    [9.99, "+$9.99"],
  ])("formats %s as %s", (input, expected) => {
    expect(formatSignedCurrency(input)).toBe(expected);
  });
});

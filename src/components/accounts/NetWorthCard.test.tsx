import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NetWorthCard } from "./NetWorthCard";

describe("NetWorthCard", () => {
  it("displays the net worth heading", () => {
    render(<NetWorthCard netWorth={0} />);
    expect(screen.getByText("Net Worth")).toBeInTheDocument();
  });

  it.each([
    [6500, "$6,500.00"],
    [-1500, "-$1,500.00"],
    [0, "$0.00"],
  ])("formats net worth %s as %s", (netWorth, expected) => {
    render(<NetWorthCard netWorth={netWorth} />);
    expect(screen.getByText(expected)).toBeInTheDocument();
  });
});

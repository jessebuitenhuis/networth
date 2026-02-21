import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NetWorthCard } from "./NetWorthCard";

describe("NetWorthCard", () => {
  it("displays the net worth heading", () => {
    render(
      <NetWorthCard netWorth={0} totalAssets={0} totalLiabilities={0} />,
    );
    expect(screen.getByText("Net Worth")).toBeInTheDocument();
  });

  it.each([
    [6500, "$6,500.00"],
    [-1500, "-$1,500.00"],
    [0, "$0.00"],
  ])("formats net worth %s as %s", (netWorth, expected) => {
    render(
      <NetWorthCard netWorth={netWorth} totalAssets={0} totalLiabilities={0} />,
    );
    const heading = screen.getByText("Net Worth");
    const value = heading.nextElementSibling!;
    expect(value).toHaveTextContent(expected);
  });

  it("displays total assets and total liabilities", () => {
    render(
      <NetWorthCard netWorth={6500} totalAssets={8000} totalLiabilities={1500} />,
    );
    expect(screen.getByText("Total Assets")).toBeInTheDocument();
    expect(screen.getByText("$8,000.00")).toBeInTheDocument();
    expect(screen.getByText("Total Liabilities")).toBeInTheDocument();
    expect(screen.getByText("$1,500.00")).toBeInTheDocument();
  });
});

import { describe, expect, it } from "vitest";

import { NetWorthCardPage } from "./NetWorthCard.page";

describe("NetWorthCard", () => {
  it("displays the net worth heading", () => {
    const page = NetWorthCardPage.render({ netWorth: 0, totalAssets: 0, totalLiabilities: 0 });
    expect(page.heading).toBeInTheDocument();
  });

  it.each([
    [6500, "$6,500.00"],
    [-1500, "-$1,500.00"],
    [0, "$0.00"],
  ])("formats net worth %s as %s", (netWorth, expected) => {
    const page = NetWorthCardPage.render({ netWorth, totalAssets: 0, totalLiabilities: 0 });
    expect(page.netWorthValue).toHaveTextContent(expected);
  });

  it("displays total assets and total liabilities", () => {
    const page = NetWorthCardPage.render({ netWorth: 6500, totalAssets: 8000, totalLiabilities: 1500 });
    expect(page.getByText("Total Assets")).toBeInTheDocument();
    expect(page.getByText("$8,000.00")).toBeInTheDocument();
    expect(page.getByText("Total Liabilities")).toBeInTheDocument();
    expect(page.getByText("$1,500.00")).toBeInTheDocument();
  });
});

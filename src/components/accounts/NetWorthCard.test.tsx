import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NetWorthCard } from "./NetWorthCard";

describe("NetWorthCard", () => {
  it("displays the net worth heading", () => {
    render(<NetWorthCard netWorth={0} />);
    expect(screen.getByText("Net Worth")).toBeInTheDocument();
  });

  it("formats positive net worth", () => {
    render(<NetWorthCard netWorth={6500} />);
    expect(screen.getByText("US$6,500.00")).toBeInTheDocument();
  });

  it("formats negative net worth", () => {
    render(<NetWorthCard netWorth={-1500} />);
    expect(screen.getByText("-US$1,500.00")).toBeInTheDocument();
  });

  it("formats zero", () => {
    render(<NetWorthCard netWorth={0} />);
    expect(screen.getByText("US$0.00")).toBeInTheDocument();
  });
});

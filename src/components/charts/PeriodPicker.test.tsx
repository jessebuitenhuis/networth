import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PeriodPicker } from "./PeriodPicker";
import { ChartPeriod } from "@/models/ChartPeriod";

describe("PeriodPicker", () => {
  it("renders four period buttons", () => {
    render(<PeriodPicker selected={ChartPeriod.Month} onSelect={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Week" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Month" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Quarter" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Year" })).toBeInTheDocument();
  });

  it("marks the selected period as pressed", () => {
    render(<PeriodPicker selected={ChartPeriod.Quarter} onSelect={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Quarter" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Week" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("calls onSelect with the clicked period", async () => {
    const onSelect = vi.fn();
    render(<PeriodPicker selected={ChartPeriod.Month} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole("button", { name: "Year" }));

    expect(onSelect).toHaveBeenCalledWith(ChartPeriod.Year);
  });
});

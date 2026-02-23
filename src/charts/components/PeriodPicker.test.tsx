import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ChartPeriod } from "@/charts/ChartPeriod";

import { PeriodPicker } from "./PeriodPicker";

const HISTORICAL = [
  ChartPeriod.OneWeek,
  ChartPeriod.MTD,
  ChartPeriod.OneMonth,
  ChartPeriod.ThreeMonths,
  ChartPeriod.SixMonths,
  ChartPeriod.YTD,
  ChartPeriod.OneYear,
  ChartPeriod.All,
  ChartPeriod.Custom,
];

const PROJECTED = [
  ChartPeriod.OneWeek,
  ChartPeriod.OneMonth,
  ChartPeriod.ThreeMonths,
  ChartPeriod.SixMonths,
  ChartPeriod.OneYear,
  ChartPeriod.All,
  ChartPeriod.Custom,
];

describe("PeriodPicker", () => {
  it("renders only the provided periods", () => {
    render(
      <PeriodPicker
        periods={PROJECTED}
        selected={ChartPeriod.OneMonth}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "1W" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1M" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3M" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "6M" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1Y" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Custom" })).toBeInTheDocument();
    // MTD and YTD should NOT be present
    expect(screen.queryByRole("button", { name: "MTD" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "YTD" })).not.toBeInTheDocument();
  });

  it("renders all historical periods", () => {
    render(
      <PeriodPicker
        periods={HISTORICAL}
        selected={ChartPeriod.OneMonth}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "MTD" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "YTD" })).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(9);
  });

  it("marks the selected period as pressed", () => {
    render(
      <PeriodPicker
        periods={HISTORICAL}
        selected={ChartPeriod.ThreeMonths}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "3M" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "1W" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("calls onSelect with the clicked period", async () => {
    const onSelect = vi.fn();
    render(
      <PeriodPicker
        periods={HISTORICAL}
        selected={ChartPeriod.OneMonth}
        onSelect={onSelect}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "1Y" }));

    expect(onSelect).toHaveBeenCalledWith(ChartPeriod.OneYear);
  });

  it("does not render navigation arrows without callbacks", () => {
    render(
      <PeriodPicker
        periods={PROJECTED}
        selected={ChartPeriod.OneMonth}
        onSelect={vi.fn()}
      />
    );

    expect(screen.queryByRole("button", { name: "Previous period" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next period" })).not.toBeInTheDocument();
  });

  it("renders navigation arrows when onPrevious and onNext are provided", () => {
    render(
      <PeriodPicker
        periods={PROJECTED}
        selected={ChartPeriod.OneMonth}
        onSelect={vi.fn()}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Previous period" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next period" })).toBeInTheDocument();
  });

  it("calls onPrevious when left arrow is clicked", async () => {
    const onPrevious = vi.fn();
    render(
      <PeriodPicker
        periods={PROJECTED}
        selected={ChartPeriod.OneMonth}
        onSelect={vi.fn()}
        onPrevious={onPrevious}
        onNext={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Previous period" }));

    expect(onPrevious).toHaveBeenCalledOnce();
  });

  it("calls onNext when right arrow is clicked", async () => {
    const onNext = vi.fn();
    render(
      <PeriodPicker
        periods={PROJECTED}
        selected={ChartPeriod.OneMonth}
        onSelect={vi.fn()}
        onPrevious={vi.fn()}
        onNext={onNext}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Next period" }));

    expect(onNext).toHaveBeenCalledOnce();
  });
});

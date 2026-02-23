import { describe, expect, it, vi } from "vitest";

import { ChartPeriod } from "@/charts/ChartPeriod";

import { PeriodPickerPage } from "./PeriodPicker.page";

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
    const page = PeriodPickerPage.render({
      periods: PROJECTED,
      selected: ChartPeriod.OneMonth,
    });

    expect(page.periodButton("1W")).toBeInTheDocument();
    expect(page.periodButton("1M")).toBeInTheDocument();
    expect(page.periodButton("3M")).toBeInTheDocument();
    expect(page.periodButton("6M")).toBeInTheDocument();
    expect(page.periodButton("1Y")).toBeInTheDocument();
    expect(page.periodButton("All")).toBeInTheDocument();
    expect(page.periodButton("Custom")).toBeInTheDocument();
    // MTD and YTD should NOT be present
    expect(page.queryPeriodButton("MTD")).not.toBeInTheDocument();
    expect(page.queryPeriodButton("YTD")).not.toBeInTheDocument();
  });

  it("renders all historical periods", () => {
    const page = PeriodPickerPage.render({
      periods: HISTORICAL,
      selected: ChartPeriod.OneMonth,
    });

    expect(page.periodButton("MTD")).toBeInTheDocument();
    expect(page.periodButton("YTD")).toBeInTheDocument();
    expect(page.allButtons()).toHaveLength(9);
  });

  it("marks the selected period as pressed", () => {
    const page = PeriodPickerPage.render({
      periods: HISTORICAL,
      selected: ChartPeriod.ThreeMonths,
    });

    expect(page.periodButton("3M")).toHaveAttribute("aria-pressed", "true");
    expect(page.periodButton("1W")).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onSelect with the clicked period", async () => {
    const onSelect = vi.fn();
    const page = PeriodPickerPage.render({
      periods: HISTORICAL,
      selected: ChartPeriod.OneMonth,
      onSelect,
    });

    await page.selectPeriod("1Y");

    expect(onSelect).toHaveBeenCalledWith(ChartPeriod.OneYear);
  });

  it("does not render navigation arrows without callbacks", () => {
    const page = PeriodPickerPage.render({
      periods: PROJECTED,
      selected: ChartPeriod.OneMonth,
    });

    expect(page.queryPreviousButton()).not.toBeInTheDocument();
    expect(page.queryNextButton()).not.toBeInTheDocument();
  });

  it("renders navigation arrows when onPrevious and onNext are provided", () => {
    const page = PeriodPickerPage.render({
      periods: PROJECTED,
      selected: ChartPeriod.OneMonth,
      onPrevious: vi.fn(),
      onNext: vi.fn(),
    });

    expect(page.previousButton).toBeInTheDocument();
    expect(page.nextButton).toBeInTheDocument();
  });

  it("calls onPrevious when left arrow is clicked", async () => {
    const onPrevious = vi.fn();
    const page = PeriodPickerPage.render({
      periods: PROJECTED,
      selected: ChartPeriod.OneMonth,
      onPrevious,
      onNext: vi.fn(),
    });

    await page.clickPrevious();

    expect(onPrevious).toHaveBeenCalledOnce();
  });

  it("calls onNext when right arrow is clicked", async () => {
    const onNext = vi.fn();
    const page = PeriodPickerPage.render({
      periods: PROJECTED,
      selected: ChartPeriod.OneMonth,
      onPrevious: vi.fn(),
      onNext,
    });

    await page.clickNext();

    expect(onNext).toHaveBeenCalledOnce();
  });
});

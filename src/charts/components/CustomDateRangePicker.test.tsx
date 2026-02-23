import { describe, expect, it, vi } from "vitest";

import { CustomDateRangePickerPage } from "./CustomDateRangePicker.page";

describe("CustomDateRangePicker", () => {
  it("renders start and end date inputs", () => {
    const page = CustomDateRangePickerPage.render({ start: "2024-07-01", end: "2024-12-31" });

    expect(page.startInput).toHaveValue("2024-07-01");
    expect(page.endInput).toHaveValue("2024-12-31");
  });

  it("calls onChange when start date changes", () => {
    const onChange = vi.fn();
    const page = CustomDateRangePickerPage.render({ start: "2024-07-01", end: "2024-12-31", onChange });

    page.changeStart("2024-08-01");

    expect(onChange).toHaveBeenCalledWith({
      start: "2024-08-01",
      end: "2024-12-31",
    });
  });

  it("calls onChange when end date changes", () => {
    const onChange = vi.fn();
    const page = CustomDateRangePickerPage.render({ start: "2024-07-01", end: "2024-12-31", onChange });

    page.changeEnd("2025-06-30");

    expect(onChange).toHaveBeenCalledWith({
      start: "2024-07-01",
      end: "2025-06-30",
    });
  });
});

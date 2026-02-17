import { fireEvent,render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CustomDateRangePicker } from "./CustomDateRangePicker";

describe("CustomDateRangePicker", () => {
  it("renders start and end date inputs", () => {
    render(
      <CustomDateRangePicker
        start="2024-07-01"
        end="2024-12-31"
        onChange={vi.fn()}
      />
    );

    expect(screen.getByLabelText("Start")).toHaveValue("2024-07-01");
    expect(screen.getByLabelText("End")).toHaveValue("2024-12-31");
  });

  it("calls onChange when start date changes", () => {
    const onChange = vi.fn();
    render(
      <CustomDateRangePicker
        start="2024-07-01"
        end="2024-12-31"
        onChange={onChange}
      />
    );

    fireEvent.change(screen.getByLabelText("Start"), {
      target: { value: "2024-08-01" },
    });

    expect(onChange).toHaveBeenCalledWith({
      start: "2024-08-01",
      end: "2024-12-31",
    });
  });

  it("calls onChange when end date changes", () => {
    const onChange = vi.fn();
    render(
      <CustomDateRangePicker
        start="2024-07-01"
        end="2024-12-31"
        onChange={onChange}
      />
    );

    fireEvent.change(screen.getByLabelText("End"), {
      target: { value: "2025-06-30" },
    });

    expect(onChange).toHaveBeenCalledWith({
      start: "2024-07-01",
      end: "2025-06-30",
    });
  });
});

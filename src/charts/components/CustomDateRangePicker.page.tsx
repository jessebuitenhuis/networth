import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import type { DateRange } from "@/charts/DateRange.type";
import { BasePageObject } from "@/test/page/BasePageObject";

import { CustomDateRangePicker } from "./CustomDateRangePicker";

type CustomDateRangePickerProps = {
  start: string;
  end: string;
  onChange?: (range: DateRange) => void;
};

export class CustomDateRangePickerPage extends BasePageObject {
  private constructor(user: ReturnType<typeof userEvent.setup>) {
    super(user);
  }

  static render({ start, end, onChange = vi.fn() }: CustomDateRangePickerProps) {
    const user = userEvent.setup();
    render(<CustomDateRangePicker start={start} end={end} onChange={onChange} />);
    return new CustomDateRangePickerPage(user);
  }

  get startInput() {
    return screen.getByLabelText("Start");
  }

  get endInput() {
    return screen.getByLabelText("End");
  }

  changeStart(value: string) {
    fireEvent.change(this.startInput, { target: { value } });
    return this;
  }

  changeEnd(value: string) {
    fireEvent.change(this.endInput, { target: { value } });
    return this;
  }
}

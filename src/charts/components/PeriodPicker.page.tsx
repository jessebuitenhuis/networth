import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChartPeriod } from "@/charts/ChartPeriod";
import { BasePageObject } from "@/test/page/BasePageObject";

import { PeriodPicker } from "./PeriodPicker";

type RenderOptions = {
  periods: ChartPeriod[];
  selected: ChartPeriod;
  onSelect?: (period: ChartPeriod) => void;
  onPrevious?: () => void;
  onNext?: () => void;
};

export class PeriodPickerPage extends BasePageObject {
  private constructor(user: ReturnType<typeof userEvent.setup>) {
    super(user);
  }

  static render(options: RenderOptions) {
    const user = userEvent.setup();
    const { periods, selected, onSelect = () => {}, onPrevious, onNext } = options;
    render(
      <PeriodPicker
        periods={periods}
        selected={selected}
        onSelect={onSelect}
        onPrevious={onPrevious}
        onNext={onNext}
      />
    );
    return new PeriodPickerPage(user);
  }

  // --- Element getters ---

  periodButton(name: string) {
    return screen.getByRole("button", { name });
  }

  get previousButton() {
    return screen.getByRole("button", { name: "Previous period" });
  }

  get nextButton() {
    return screen.getByRole("button", { name: "Next period" });
  }

  allButtons() {
    return screen.getAllByRole("button");
  }

  // --- Query methods (nullable) ---

  queryPeriodButton(name: string) {
    return screen.queryByRole("button", { name });
  }

  queryPreviousButton() {
    return screen.queryByRole("button", { name: "Previous period" });
  }

  queryNextButton() {
    return screen.queryByRole("button", { name: "Next period" });
  }

  isPeriodPressed(name: string) {
    return this.periodButton(name).getAttribute("aria-pressed") === "true";
  }

  // --- Actions ---

  async selectPeriod(name: string) {
    await this._user.click(this.periodButton(name));
    return this;
  }

  async clickPrevious() {
    await this._user.click(this.previousButton);
    return this;
  }

  async clickNext() {
    await this._user.click(this.nextButton);
    return this;
  }
}

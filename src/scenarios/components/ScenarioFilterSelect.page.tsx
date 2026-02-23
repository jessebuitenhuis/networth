import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Scenario } from "@/scenarios/Scenario.type";
import { BasePageObject } from "@/test/page/BasePageObject";

import { ScenarioFilterSelect } from "./ScenarioFilterSelect";

type ScenarioFilterSelectProps = {
  scenarios: Scenario[];
  value: string | null;
  onValueChange: (id: string | null) => void;
};

export class ScenarioFilterSelectPage extends BasePageObject {
  private constructor(user: ReturnType<typeof userEvent.setup>) {
    super(user);
  }

  static render({ scenarios, value, onValueChange }: ScenarioFilterSelectProps) {
    const user = userEvent.setup();
    render(
      <ScenarioFilterSelect
        scenarios={scenarios}
        value={value}
        onValueChange={onValueChange}
      />
    );
    return new ScenarioFilterSelectPage(user);
  }

  // --- Element getters ---

  get trigger() {
    return screen.getByRole("combobox", { name: "Scenario filter" });
  }

  // --- Actions ---

  async open() {
    await this._user.click(this.trigger);
    return this;
  }

  async selectScenario(name: string) {
    await this.open();
    await this._user.click(screen.getByRole("option", { name }));
    return this;
  }
}

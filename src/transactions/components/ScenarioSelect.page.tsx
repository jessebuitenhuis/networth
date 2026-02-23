import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Scenario } from "@/scenarios/Scenario.type";
import { BasePageObject } from "@/test/page/BasePageObject";

import { ScenarioSelect } from "./ScenarioSelect";

type ScenarioSelectProps = {
  scenarios: Scenario[];
  value: string;
  onValueChange: (value: string) => void;
  onCreateScenario: (name: string) => string;
  formOnSubmit?: (e: React.FormEvent) => void;
};

export class ScenarioSelectPage extends BasePageObject {
  private constructor(user: ReturnType<typeof userEvent.setup>) {
    super(user);
  }

  static render({
    scenarios,
    value,
    onValueChange,
    onCreateScenario,
    formOnSubmit,
  }: ScenarioSelectProps) {
    const user = userEvent.setup();
    const component = (
      <ScenarioSelect
        scenarios={scenarios}
        value={value}
        onValueChange={onValueChange}
        onCreateScenario={onCreateScenario}
      />
    );
    if (formOnSubmit) {
      render(<form onSubmit={formOnSubmit}>{component}</form>);
    } else {
      render(component);
    }
    return new ScenarioSelectPage(user);
  }

  // --- Element getters ---

  get trigger() {
    return screen.getByRole("combobox", { name: /scenario/i });
  }

  get scenarioNameInput() {
    return screen.getByLabelText(/scenario name/i);
  }

  get createButton() {
    return screen.getByRole("button", { name: /create/i });
  }

  get cancelButton() {
    return screen.getByRole("button", { name: /cancel/i });
  }

  get allOptions() {
    return screen.getAllByRole("option");
  }

  // --- Query methods ---

  queryTrigger() {
    return screen.queryByRole("combobox", { name: /scenario/i });
  }

  queryScenarioNameInput() {
    return screen.queryByLabelText(/scenario name/i);
  }

  // --- Actions ---

  async open() {
    await this._user.click(this.trigger);
    return this;
  }

  async selectOption(name: string) {
    await this._user.click(screen.getByRole("option", { name }));
    return this;
  }

  async selectScenario(name: string) {
    await this.open();
    await this.selectOption(name);
    return this;
  }

  async enterCreateMode() {
    await this.selectScenario("Create new scenario...");
    return this;
  }

  async typeScenarioName(name: string) {
    await this._user.type(this.scenarioNameInput, name);
    return this;
  }

  async clickCreate() {
    await this._user.click(this.createButton);
    return this;
  }

  async clickCancel() {
    await this._user.click(this.cancelButton);
    return this;
  }

  async pressKey(key: string) {
    await this._user.keyboard(key);
    return this;
  }

  async createScenarioInline(name: string) {
    await this.enterCreateMode();
    await this.typeScenarioName(name);
    await this.clickCreate();
    return this;
  }
}

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

import type { Scenario } from "@/scenarios/Scenario.type";
import { BasePageObject } from "@/test/page/BasePageObject";

import { ScenarioPicker } from "./ScenarioPicker";

type ScenarioPickerProps = {
  scenarios: Scenario[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onClearAll?: () => void;
  renderActions?: (scenario: Scenario) => ReactNode;
};

export class ScenarioPickerPage extends BasePageObject {
  private constructor(user: ReturnType<typeof userEvent.setup>) {
    super(user);
  }

  static render({
    scenarios,
    selectedIds,
    onToggle,
    onClearAll,
    renderActions,
  }: ScenarioPickerProps) {
    const user = userEvent.setup();
    render(
      <ScenarioPicker
        scenarios={scenarios}
        selectedIds={selectedIds}
        onToggle={onToggle}
        onClearAll={onClearAll}
        renderActions={renderActions}
      />
    );
    return new ScenarioPickerPage(user);
  }

  static renderAndGetContainer(props: ScenarioPickerProps) {
    const user = userEvent.setup();
    const { container } = render(
      <ScenarioPicker
        scenarios={props.scenarios}
        selectedIds={props.selectedIds}
        onToggle={props.onToggle}
        onClearAll={props.onClearAll}
        renderActions={props.renderActions}
      />
    );
    return { page: new ScenarioPickerPage(user), container };
  }

  // --- Element getters ---

  triggerButton(count: number) {
    return screen.getByRole("button", { name: `Scenarios (${count})` });
  }

  checkbox(name: string) {
    return screen.getByRole("checkbox", { name });
  }

  get deselectAllButton() {
    return screen.getByRole("button", { name: "Deselect all" });
  }

  // --- Query methods ---

  queryDeselectAllButton() {
    return screen.queryByRole("button", { name: "Deselect all" });
  }

  queryActionButton(id: string) {
    return screen.queryByTestId(`action-${id}`);
  }

  // --- Actions ---

  async open(count: number) {
    await this._user.click(this.triggerButton(count));
    return this;
  }

  async toggleCheckbox(name: string) {
    await this._user.click(this.checkbox(name));
    return this;
  }

  async clickDeselectAll() {
    await this._user.click(this.deselectAllButton);
    return this;
  }
}

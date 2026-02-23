import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BasePageObject } from "@/test/page/BasePageObject";

import { ScenarioLegend } from "./ScenarioLegend";

type ScenarioLegendEntry = {
  name: string;
  color: string;
  lineStyle: "solid" | "dashed" | "dotted";
};

type ScenarioLegendProps = {
  entries: ScenarioLegendEntry[];
};

export class ScenarioLegendPage extends BasePageObject {
  readonly container: HTMLElement;

  private constructor(user: ReturnType<typeof userEvent.setup>, container: HTMLElement) {
    super(user);
    this.container = container;
  }

  static render({ entries }: ScenarioLegendProps) {
    const user = userEvent.setup();
    const { container } = render(<ScenarioLegend entries={entries} />);
    return new ScenarioLegendPage(user, container);
  }

  get legendIndicators() {
    return this.container.querySelectorAll('[data-testid="legend-indicator"]');
  }

  get wrapper() {
    return this.container.firstChild as HTMLElement | null;
  }

  getText(name: string) {
    return screen.getByText(name);
  }
}

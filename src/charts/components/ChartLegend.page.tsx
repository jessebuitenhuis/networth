import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import type { Account } from "@/accounts/Account.type";
import { BasePageObject } from "@/test/page/BasePageObject";

import { ChartLegend } from "./ChartLegend";

type ChartLegendProps = {
  accounts: Account[];
  excludedIds: Set<string>;
  onToggle?: (id: string) => void;
};

export class ChartLegendPage extends BasePageObject {
  readonly container: HTMLElement;

  private constructor(user: ReturnType<typeof userEvent.setup>, container: HTMLElement) {
    super(user);
    this.container = container;
  }

  static render({ accounts, excludedIds, onToggle = vi.fn() }: ChartLegendProps) {
    const user = userEvent.setup();
    const { container } = render(
      <ChartLegend accounts={accounts} excludedIds={excludedIds} onToggle={onToggle} />
    );
    return new ChartLegendPage(user, container);
  }

  get legendDots() {
    return document.querySelectorAll("[data-testid='legend-dot']");
  }

  getButton(name: string) {
    return screen.getByRole("button", { name });
  }

  async clickButton(name: string) {
    await this._user.click(this.getButton(name));
    return this;
  }
}

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { AccountType } from "@/accounts/AccountType";

import type { WizardAccountEntry } from "../WizardAccountEntry.type";
import type { WizardRecurringEntry } from "../WizardRecurringEntry.type";
import { IncomeExpensesStep } from "./IncomeExpensesStep";

const DEFAULT_ACCOUNTS: WizardAccountEntry[] = [
  { tempId: "a1", name: "Checking", type: AccountType.Asset, balance: 0 },
];

export class IncomeExpensesStepPage {
  private constructor(
    private _user: ReturnType<typeof userEvent.setup>,
    private _props: {
      onAdd: ReturnType<typeof vi.fn>;
      onRemove: ReturnType<typeof vi.fn>;
      onUpdate: ReturnType<typeof vi.fn>;
    },
  ) {}

  static render(
    entries: WizardRecurringEntry[] = [],
    accounts: WizardAccountEntry[] = DEFAULT_ACCOUNTS,
  ) {
    const user = userEvent.setup();
    const props = {
      onAdd: vi.fn(),
      onRemove: vi.fn(),
      onUpdate: vi.fn(),
    };

    render(
      <IncomeExpensesStep
        entries={entries}
        accounts={accounts}
        onAdd={props.onAdd}
        onRemove={props.onRemove}
        onUpdate={props.onUpdate}
        generateTempId={() => "temp-id"}
      />,
    );

    return new IncomeExpensesStepPage(user, props);
  }

  get onAdd() {
    return this._props.onAdd;
  }

  get onRemove() {
    return this._props.onRemove;
  }

  getSuggestionButton(description: string) {
    return screen.getByRole("button", { name: new RegExp(`^[^A-Za-z]+ ${description}$`) });
  }

  querySuggestionButton(description: string) {
    return screen.queryByRole("button", { name: new RegExp(`^[^A-Za-z]+ ${description}$`) });
  }

  getRemoveButton(description: string) {
    return screen.getByRole("button", { name: `Remove ${description}` });
  }

  getText(text: string | RegExp) {
    return screen.getByText(text);
  }

  queryText(text: string | RegExp) {
    return screen.queryByText(text);
  }

  async clickSuggestion(description: string) {
    await this._user.click(this.getSuggestionButton(description));
    return this;
  }

  async clickRemove(description: string) {
    await this._user.click(this.getRemoveButton(description));
    return this;
  }
}

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

import { BasePageObject } from "@/test/page/BasePageObject";

import {
  MultiSelectPicker,
  type MultiSelectPickerItem,
} from "./MultiSelectPicker";

type MultiSelectPickerProps = {
  label: string;
  items: MultiSelectPickerItem[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onClearAll?: () => void;
  renderActions?: (item: MultiSelectPickerItem) => ReactNode;
  popoverWidth?: string;
};

export class MultiSelectPickerPage extends BasePageObject {
  private constructor(user: ReturnType<typeof userEvent.setup>) {
    super(user);
  }

  static render(props: MultiSelectPickerProps) {
    const user = userEvent.setup();
    render(<MultiSelectPicker {...props} />);
    return new MultiSelectPickerPage(user);
  }

  // --- Element getters ---

  trigger(label: string, selectedCount: number) {
    return screen.getByRole("button", { name: `${label} (${selectedCount})` });
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

  queryByTestId(testId: string | RegExp) {
    return screen.queryByTestId(testId);
  }

  getByTestId(testId: string) {
    return screen.getByTestId(testId);
  }

  // --- Actions ---

  async open(label: string, selectedCount: number) {
    await this._user.click(this.trigger(label, selectedCount));
    return this;
  }

  async toggleItem(name: string) {
    await this._user.click(this.checkbox(name));
    return this;
  }

  async clickDeselectAll() {
    await this._user.click(this.deselectAllButton);
    return this;
  }
}

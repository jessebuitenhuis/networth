import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { BasePageObject } from "@/test/page/BasePageObject";
import {
  emptyFilters,
  type TransactionFilters,
} from "@/transactions/TransactionFilters.type";

import { TransactionFilterBar } from "./TransactionFilterBar";

type TransactionFilterBarProps = {
  filters?: TransactionFilters;
  onChange?: (filters: TransactionFilters) => void;
  resultCount?: number;
  totalCount?: number;
};

export class TransactionFilterBarPage extends BasePageObject {
  readonly onChange: ReturnType<typeof vi.fn>;

  private constructor(
    user: ReturnType<typeof userEvent.setup>,
    onChange: ReturnType<typeof vi.fn>
  ) {
    super(user);
    this.onChange = onChange;
  }

  static render({
    filters = emptyFilters,
    onChange,
    resultCount = 10,
    totalCount = 10,
  }: TransactionFilterBarProps = {}) {
    const user = userEvent.setup();
    const mockOnChange = onChange ?? vi.fn();
    render(
      <TransactionFilterBar
        filters={filters}
        onChange={mockOnChange}
        resultCount={resultCount}
        totalCount={totalCount}
      />
    );
    return new TransactionFilterBarPage(user, mockOnChange as ReturnType<typeof vi.fn>);
  }

  get searchInput() {
    return screen.getByLabelText("Search transactions");
  }

  get toggleFiltersButton() {
    return screen.getByLabelText("Toggle filters");
  }

  get clearFiltersButton() {
    return screen.getByLabelText("Clear filters");
  }

  get fromDateInput() {
    return screen.getByLabelText("From date");
  }

  get toDateInput() {
    return screen.getByLabelText("To date");
  }

  get minAmountInput() {
    return screen.getByLabelText("Min amount");
  }

  get maxAmountInput() {
    return screen.getByLabelText("Max amount");
  }

  queryFromDate() {
    return screen.queryByLabelText("From date");
  }

  queryClearFiltersButton() {
    return screen.queryByLabelText("Clear filters");
  }

  queryResultCount() {
    return screen.queryByText(/Showing/);
  }

  async expandFilters() {
    await this._user.click(this.toggleFiltersButton);
    return this;
  }

  async typeInSearch(text: string) {
    await this._user.type(this.searchInput, text);
    return this;
  }

  async typeInField(label: string, text: string) {
    await this._user.type(screen.getByLabelText(label), text);
    return this;
  }

  async clickClearFilters() {
    await this._user.click(this.clearFiltersButton);
    return this;
  }

  async clickToggleFilters() {
    await this._user.click(this.toggleFiltersButton);
    return this;
  }
}

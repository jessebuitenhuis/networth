import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import type { MultiSelectPickerItem } from "@/components/shared/MultiSelectPicker";
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
  showAccountFilter?: boolean;
  accounts?: MultiSelectPickerItem[];
  categories?: MultiSelectPickerItem[];
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
    showAccountFilter,
    accounts,
    categories,
  }: TransactionFilterBarProps = {}) {
    const user = userEvent.setup();
    const mockOnChange = onChange ?? vi.fn();
    render(
      <TransactionFilterBar
        filters={filters}
        onChange={mockOnChange}
        resultCount={resultCount}
        totalCount={totalCount}
        showAccountFilter={showAccountFilter}
        accounts={accounts}
        categories={categories}
      />
    );
    return new TransactionFilterBarPage(user, mockOnChange as ReturnType<typeof vi.fn>);
  }

  get searchButton() {
    return screen.getByLabelText("Open search");
  }

  get searchInput() {
    return screen.getByLabelText("Search transactions");
  }

  get clearFiltersButton() {
    return screen.getByLabelText("Clear filters");
  }

  get dateRangeButton() {
    return screen.getByLabelText("Date range filter");
  }

  get amountRangeButton() {
    return screen.getByLabelText("Amount range filter");
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

  querySearchButton() {
    return screen.queryByLabelText("Open search");
  }

  querySearchInput() {
    return screen.queryByLabelText("Search transactions");
  }

  queryClearFiltersButton() {
    return screen.queryByLabelText("Clear filters");
  }

  queryResultCount() {
    return screen.queryByText(/Showing/);
  }

  async clickSearchButton() {
    await this._user.click(this.searchButton);
    return this;
  }

  async typeInSearch(text: string) {
    await this._user.type(this.searchInput, text);
    return this;
  }

  async openDateRange() {
    await this._user.click(this.dateRangeButton);
    return this;
  }

  async openAmountRange() {
    await this._user.click(this.amountRangeButton);
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
}

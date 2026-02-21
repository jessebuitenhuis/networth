import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { emptyFilters, type TransactionFilters } from "@/transactions/TransactionFilters.type";

import { TransactionFilterBar } from "./TransactionFilterBar";

function createFilterBarPage(
  overrides: Partial<{
    filters: TransactionFilters;
    onChange: (filters: TransactionFilters) => void;
    resultCount: number;
    totalCount: number;
  }> = {}
) {
  const user = userEvent.setup();
  const onChange = overrides.onChange ?? vi.fn();
  const props = {
    filters: emptyFilters,
    onChange,
    resultCount: 10,
    totalCount: 10,
    ...overrides,
  };
  const result = render(<TransactionFilterBar {...props} />);

  return {
    ...result,
    onChange,
    searchInput: () => screen.getByLabelText("Search transactions"),
    toggleFiltersButton: () => screen.getByLabelText("Toggle filters"),
    clearFiltersButton: () => screen.getByLabelText("Clear filters"),
    fromDateInput: () => screen.getByLabelText("From date"),
    toDateInput: () => screen.getByLabelText("To date"),
    minAmountInput: () => screen.getByLabelText("Min amount"),
    maxAmountInput: () => screen.getByLabelText("Max amount"),
    expandFilters: () => user.click(screen.getByLabelText("Toggle filters")),
    type: user.type,
    click: user.click,
  };
}

describe("TransactionFilterBar", () => {
  it("renders search input and filter toggle button", () => {
    const page = createFilterBarPage();
    expect(page.searchInput()).toBeInTheDocument();
    expect(page.toggleFiltersButton()).toBeInTheDocument();
  });

  it("does not show advanced filters by default", () => {
    createFilterBarPage();
    expect(screen.queryByLabelText("From date")).not.toBeInTheDocument();
  });

  it("shows advanced filters when toggle is clicked", async () => {
    const page = createFilterBarPage();

    await page.expandFilters();

    expect(page.fromDateInput()).toBeInTheDocument();
    expect(page.toDateInput()).toBeInTheDocument();
    expect(page.minAmountInput()).toBeInTheDocument();
    expect(page.maxAmountInput()).toBeInTheDocument();
  });

  it("hides advanced filters when toggle is clicked again", async () => {
    const page = createFilterBarPage();

    await page.expandFilters();
    expect(page.fromDateInput()).toBeInTheDocument();

    await page.click(page.toggleFiltersButton());
    expect(screen.queryByLabelText("From date")).not.toBeInTheDocument();
  });

  it("calls onChange when typing in search input", async () => {
    const page = createFilterBarPage();

    await page.type(page.searchInput(), "g");

    expect(page.onChange).toHaveBeenCalledWith({
      ...emptyFilters,
      description: "g",
    });
  });

  it.each([
    { field: "From date", filterKey: "dateFrom", value: "2024-01-15" },
    { field: "To date", filterKey: "dateTo", value: "2024-12-31" },
    { field: "Min amount", filterKey: "amountMin", value: "5" },
    { field: "Max amount", filterKey: "amountMax", value: "9" },
  ] as const)(
    "calls onChange when setting $field",
    async ({ field, filterKey, value }) => {
      const page = createFilterBarPage();

      await page.expandFilters();
      await page.type(screen.getByLabelText(field), value);

      expect(page.onChange).toHaveBeenCalledWith(
        expect.objectContaining({ [filterKey]: value })
      );
    }
  );

  it("does not show clear button when no filters active", () => {
    createFilterBarPage();
    expect(screen.queryByLabelText("Clear filters")).not.toBeInTheDocument();
  });

  it("shows clear button when filters are active", () => {
    const page = createFilterBarPage({
      filters: { ...emptyFilters, description: "test" },
    });
    expect(page.clearFiltersButton()).toBeInTheDocument();
  });

  it("clears all filters when clear button is clicked", async () => {
    const page = createFilterBarPage({
      filters: { ...emptyFilters, description: "test" },
    });

    await page.click(page.clearFiltersButton());

    expect(page.onChange).toHaveBeenCalledWith(emptyFilters);
  });

  it("does not show result count when no filters active", () => {
    createFilterBarPage({ resultCount: 5, totalCount: 10 });
    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
  });

  it("shows result count when filters are active", () => {
    createFilterBarPage({
      filters: { ...emptyFilters, description: "test" },
      resultCount: 3,
      totalCount: 10,
    });
    expect(screen.getByText("Showing 3 of 10 transactions")).toBeInTheDocument();
  });

  it("displays current search value", () => {
    const page = createFilterBarPage({
      filters: { ...emptyFilters, description: "groceries" },
    });
    expect(page.searchInput()).toHaveValue("groceries");
  });
});

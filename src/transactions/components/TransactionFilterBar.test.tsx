import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { emptyFilters } from "@/transactions/TransactionFilters.type";

import { TransactionFilterBarPage } from "./TransactionFilterBar.page";

describe("TransactionFilterBar", () => {
  it("renders search button and date/amount filter controls", () => {
    const page = TransactionFilterBarPage.render();
    expect(page.searchButton).toBeInTheDocument();
    expect(page.dateRangeButton).toBeInTheDocument();
    expect(page.amountRangeButton).toBeInTheDocument();
  });

  it("does not show search input by default", () => {
    TransactionFilterBarPage.render();
    expect(screen.queryByLabelText("Search transactions")).not.toBeInTheDocument();
  });

  it("expands search input when search button is clicked", async () => {
    const page = TransactionFilterBarPage.render();
    await page.clickSearchButton();
    expect(page.searchInput).toBeInTheDocument();
  });

  it("shows search input when description filter is pre-populated", () => {
    const page = TransactionFilterBarPage.render({
      filters: { ...emptyFilters, description: "groceries" },
    });
    expect(page.searchInput).toBeInTheDocument();
    expect(page.searchInput).toHaveValue("groceries");
  });

  it("calls onChange when typing in search input", async () => {
    const page = TransactionFilterBarPage.render();
    await page.clickSearchButton();
    await page.typeInSearch("g");

    expect(page.onChange).toHaveBeenCalledWith({
      ...emptyFilters,
      description: "g",
    });
  });

  it("shows date range inputs inside popover", async () => {
    const page = TransactionFilterBarPage.render();
    await page.openDateRange();
    expect(page.fromDateInput).toBeInTheDocument();
    expect(page.toDateInput).toBeInTheDocument();
  });

  it("shows amount range inputs inside popover", async () => {
    const page = TransactionFilterBarPage.render();
    await page.openAmountRange();
    expect(page.minAmountInput).toBeInTheDocument();
    expect(page.maxAmountInput).toBeInTheDocument();
  });

  it.each([
    { field: "From date", filterKey: "dateFrom", value: "2024-01-15", popover: "date" },
    { field: "To date", filterKey: "dateTo", value: "2024-12-31", popover: "date" },
    { field: "Min amount", filterKey: "amountMin", value: "5", popover: "amount" },
    { field: "Max amount", filterKey: "amountMax", value: "9", popover: "amount" },
  ] as const)(
    "calls onChange when setting $field",
    async ({ field, filterKey, value, popover }) => {
      const page = TransactionFilterBarPage.render();

      if (popover === "date") await page.openDateRange();
      else await page.openAmountRange();
      await page.typeInField(field, value);

      expect(page.onChange).toHaveBeenCalledWith(
        expect.objectContaining({ [filterKey]: value })
      );
    }
  );

  it("does not show clear button when no filters active", () => {
    TransactionFilterBarPage.render();
    expect(screen.queryByLabelText("Clear filters")).not.toBeInTheDocument();
  });

  it("shows clear button when filters are active", () => {
    const page = TransactionFilterBarPage.render({
      filters: { ...emptyFilters, description: "test" },
    });
    expect(page.clearFiltersButton).toBeInTheDocument();
  });

  it("clears all filters when clear button is clicked", async () => {
    const onChange = vi.fn();
    const page = TransactionFilterBarPage.render({
      filters: { ...emptyFilters, description: "test" },
      onChange,
    });

    await page.clickClearFilters();

    expect(onChange).toHaveBeenCalledWith(emptyFilters);
  });

  it("does not show result count when no filters active", () => {
    TransactionFilterBarPage.render({ resultCount: 5, totalCount: 10 });
    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
  });

  it("shows result count when filters are active", () => {
    TransactionFilterBarPage.render({
      filters: { ...emptyFilters, description: "test" },
      resultCount: 3,
      totalCount: 10,
    });
    expect(screen.getByText("Showing 3 of 10 transactions")).toBeInTheDocument();
  });

  it("shows account filter when showAccountFilter is true and accounts are provided", () => {
    TransactionFilterBarPage.render({
      showAccountFilter: true,
      accounts: [{ id: "a1", label: "Checking" }],
    });
    expect(screen.getByText("Accounts (0)")).toBeInTheDocument();
  });

  it("does not show account filter when showAccountFilter is false", () => {
    TransactionFilterBarPage.render({
      showAccountFilter: false,
      accounts: [{ id: "a1", label: "Checking" }],
    });
    expect(screen.queryByText("Accounts (0)")).not.toBeInTheDocument();
  });

  it("shows category filter when categories are provided", () => {
    TransactionFilterBarPage.render({
      categories: [{ id: "c1", label: "Food" }],
    });
    expect(screen.getByText("Categories (0)")).toBeInTheDocument();
  });
});

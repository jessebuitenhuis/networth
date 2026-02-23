import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { emptyFilters } from "@/transactions/TransactionFilters.type";

import { TransactionFilterBarPage } from "./TransactionFilterBar.page";

describe("TransactionFilterBar", () => {
  it("renders search input and filter toggle button", () => {
    const page = TransactionFilterBarPage.render();
    expect(page.searchInput).toBeInTheDocument();
    expect(page.toggleFiltersButton).toBeInTheDocument();
  });

  it("does not show advanced filters by default", () => {
    TransactionFilterBarPage.render();
    expect(screen.queryByLabelText("From date")).not.toBeInTheDocument();
  });

  it("shows advanced filters when toggle is clicked", async () => {
    const page = TransactionFilterBarPage.render();

    await page.expandFilters();

    expect(page.fromDateInput).toBeInTheDocument();
    expect(page.toDateInput).toBeInTheDocument();
    expect(page.minAmountInput).toBeInTheDocument();
    expect(page.maxAmountInput).toBeInTheDocument();
  });

  it("hides advanced filters when toggle is clicked again", async () => {
    const page = TransactionFilterBarPage.render();

    await page.expandFilters();
    expect(page.fromDateInput).toBeInTheDocument();

    await page.clickToggleFilters();
    expect(page.queryFromDate()).not.toBeInTheDocument();
  });

  it("calls onChange when typing in search input", async () => {
    const page = TransactionFilterBarPage.render();

    await page.typeInSearch("g");

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
      const page = TransactionFilterBarPage.render();

      await page.expandFilters();
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

  it("displays current search value", () => {
    const page = TransactionFilterBarPage.render({
      filters: { ...emptyFilters, description: "groceries" },
    });
    expect(page.searchInput).toHaveValue("groceries");
  });
});

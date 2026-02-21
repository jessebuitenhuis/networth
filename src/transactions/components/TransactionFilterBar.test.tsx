import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { emptyFilters, type TransactionFilters } from "@/transactions/TransactionFilters.type";

import { TransactionFilterBar } from "./TransactionFilterBar";

function renderFilterBar(
  overrides: Partial<{
    filters: TransactionFilters;
    onChange: (filters: TransactionFilters) => void;
    resultCount: number;
    totalCount: number;
  }> = {}
) {
  const props = {
    filters: emptyFilters,
    onChange: vi.fn(),
    resultCount: 10,
    totalCount: 10,
    ...overrides,
  };
  return { ...render(<TransactionFilterBar {...props} />), onChange: props.onChange };
}

describe("TransactionFilterBar", () => {
  it("renders search input", () => {
    renderFilterBar();
    expect(screen.getByLabelText("Search transactions")).toBeInTheDocument();
  });

  it("renders filter toggle button", () => {
    renderFilterBar();
    expect(screen.getByLabelText("Toggle filters")).toBeInTheDocument();
  });

  it("does not show advanced filters by default", () => {
    renderFilterBar();
    expect(screen.queryByLabelText("From date")).not.toBeInTheDocument();
  });

  it("shows advanced filters when toggle is clicked", async () => {
    const user = userEvent.setup();
    renderFilterBar();

    await user.click(screen.getByLabelText("Toggle filters"));

    expect(screen.getByLabelText("From date")).toBeInTheDocument();
    expect(screen.getByLabelText("To date")).toBeInTheDocument();
    expect(screen.getByLabelText("Min amount")).toBeInTheDocument();
    expect(screen.getByLabelText("Max amount")).toBeInTheDocument();
  });

  it("hides advanced filters when toggle is clicked again", async () => {
    const user = userEvent.setup();
    renderFilterBar();

    await user.click(screen.getByLabelText("Toggle filters"));
    expect(screen.getByLabelText("From date")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Toggle filters"));
    expect(screen.queryByLabelText("From date")).not.toBeInTheDocument();
  });

  it("calls onChange when typing in search input", async () => {
    const user = userEvent.setup();
    const { onChange } = renderFilterBar();

    await user.type(screen.getByLabelText("Search transactions"), "g");

    expect(onChange).toHaveBeenCalledWith({
      ...emptyFilters,
      description: "g",
    });
  });

  it("calls onChange when setting date from", async () => {
    const user = userEvent.setup();
    const { onChange } = renderFilterBar();

    await user.click(screen.getByLabelText("Toggle filters"));
    await user.type(screen.getByLabelText("From date"), "2024-01-15");

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ dateFrom: "2024-01-15" })
    );
  });

  it("calls onChange when setting date to", async () => {
    const user = userEvent.setup();
    const { onChange } = renderFilterBar();

    await user.click(screen.getByLabelText("Toggle filters"));
    await user.type(screen.getByLabelText("To date"), "2024-12-31");

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ dateTo: "2024-12-31" })
    );
  });

  it("calls onChange when setting min amount", async () => {
    const user = userEvent.setup();
    const { onChange } = renderFilterBar();

    await user.click(screen.getByLabelText("Toggle filters"));
    await user.type(screen.getByLabelText("Min amount"), "100");

    expect(onChange).toHaveBeenCalled();
  });

  it("calls onChange when setting max amount", async () => {
    const user = userEvent.setup();
    const { onChange } = renderFilterBar();

    await user.click(screen.getByLabelText("Toggle filters"));
    await user.type(screen.getByLabelText("Max amount"), "500");

    expect(onChange).toHaveBeenCalled();
  });

  it("does not show clear button when no filters active", () => {
    renderFilterBar();
    expect(screen.queryByLabelText("Clear filters")).not.toBeInTheDocument();
  });

  it("shows clear button when filters are active", () => {
    renderFilterBar({
      filters: { ...emptyFilters, description: "test" },
    });
    expect(screen.getByLabelText("Clear filters")).toBeInTheDocument();
  });

  it("clears all filters when clear button is clicked", async () => {
    const user = userEvent.setup();
    const { onChange } = renderFilterBar({
      filters: { ...emptyFilters, description: "test" },
    });

    await user.click(screen.getByLabelText("Clear filters"));

    expect(onChange).toHaveBeenCalledWith(emptyFilters);
  });

  it("does not show result count when no filters active", () => {
    renderFilterBar({ resultCount: 5, totalCount: 10 });
    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
  });

  it("shows result count when filters are active", () => {
    renderFilterBar({
      filters: { ...emptyFilters, description: "test" },
      resultCount: 3,
      totalCount: 10,
    });
    expect(screen.getByText("Showing 3 of 10 transactions")).toBeInTheDocument();
  });

  it("displays current search value", () => {
    renderFilterBar({
      filters: { ...emptyFilters, description: "groceries" },
    });
    expect(screen.getByLabelText("Search transactions")).toHaveValue("groceries");
  });
});

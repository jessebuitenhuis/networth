import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TransactionListItem } from "./TransactionListItem";

describe("TransactionListItem", () => {
  it("displays the description", () => {
    render(
      <TransactionListItem
        description="Groceries"
        date="2024-01-20"
        amount={-200}
      />
    );
    expect(screen.getByText("Groceries")).toBeInTheDocument();
  });

  it("displays formatted date", () => {
    render(
      <TransactionListItem
        description="Groceries"
        date="2024-01-20"
        amount={-200}
      />
    );
    expect(screen.getByText("1/20/2024")).toBeInTheDocument();
  });

  it("displays positive amounts in green with plus sign", () => {
    render(
      <TransactionListItem
        description="Salary"
        date="2024-01-15"
        amount={1000}
      />
    );
    const amount = screen.getByText("+$1,000.00");
    expect(amount).toHaveClass("text-green-600");
  });

  it("displays negative amounts in red with minus sign", () => {
    render(
      <TransactionListItem
        description="Groceries"
        date="2024-01-20"
        amount={-200}
      />
    );
    const amount = screen.getByText("-$200.00");
    expect(amount).toHaveClass("text-red-600");
  });

  it("renders solid border by default", () => {
    const { container } = render(
      <TransactionListItem
        description="Groceries"
        date="2024-01-20"
        amount={-200}
      />
    );
    const card = container.querySelector("[data-slot='card']");
    expect(card).not.toHaveClass("border-dashed");
  });

  it("renders dashed border when projected", () => {
    const { container } = render(
      <TransactionListItem
        description="Groceries"
        date="2024-01-20"
        amount={-200}
        isProjected
      />
    );
    const card = container.querySelector("[data-slot='card']");
    expect(card).toHaveClass("border-dashed");
  });

  it("renders muted description when projected", () => {
    render(
      <TransactionListItem
        description="Groceries"
        date="2024-01-20"
        amount={-200}
        isProjected
      />
    );
    const description = screen.getByText("Groceries");
    expect(description).toHaveClass("text-muted-foreground");
  });

  it("does not show recurring indicator by default", () => {
    render(
      <TransactionListItem
        description="Groceries"
        date="2024-01-20"
        amount={-200}
      />
    );
    expect(screen.queryByText("Recurring")).not.toBeInTheDocument();
  });

  it("shows recurring indicator when isRecurring is true", () => {
    render(
      <TransactionListItem
        description="Salary"
        date="2024-01-15"
        amount={5000}
        isRecurring
      />
    );
    expect(screen.getByText("Recurring")).toBeInTheDocument();
  });

  it("renders editAction when provided", () => {
    render(
      <TransactionListItem
        description="Groceries"
        date="2024-01-20"
        amount={-200}
        editAction={<button aria-label="Edit">Edit</button>}
      />
    );
    expect(screen.getByLabelText("Edit")).toBeInTheDocument();
  });
});

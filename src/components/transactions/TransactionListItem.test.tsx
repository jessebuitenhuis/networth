import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TransactionListItem } from "./TransactionListItem";

describe("TransactionListItem", () => {
  it("displays the description", () => {
    render(
      <TransactionListItem
        description="Groceries"
        date="2024-01-20"
        amount={-200}
        onDelete={() => {}}
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
        onDelete={() => {}}
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
        onDelete={() => {}}
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
        onDelete={() => {}}
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
        onDelete={() => {}}
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
        onDelete={() => {}}
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
        onDelete={() => {}}
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
        onDelete={() => {}}
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
        onDelete={() => {}}
        isRecurring
      />
    );
    expect(screen.getByText("Recurring")).toBeInTheDocument();
  });

  it("calls onDelete when delete button is clicked", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(
      <TransactionListItem
        description="Groceries"
        date="2024-01-20"
        amount={-200}
        onDelete={onDelete}
      />
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledOnce();
  });
});

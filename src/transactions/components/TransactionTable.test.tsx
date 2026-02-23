import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { TooltipProvider } from "@/components/ui/tooltip";
import { mockResizeObserver } from "@/test/mocks/mockResizeObserver";
import type { DisplayTransaction } from "@/transactions/DisplayTransaction.type";

import { TransactionTable } from "./TransactionTable";

mockResizeObserver();

describe("TransactionTable", () => {
  const mockEditAction = <button aria-label="Edit">Edit</button>;

  it("renders table headers", () => {
    const items: DisplayTransaction[] = [];
    render(<TransactionTable items={items} />);

    expect(screen.getByRole("columnheader", { name: /Date/ })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /Description/ })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /Amount/ })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Actions" })).toBeInTheDocument();
  });

  it("renders transaction rows", () => {
    const items: DisplayTransaction[] = [
      {
        id: "1",
        description: "Groceries",
        date: "2024-01-20",
        amount: -200,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
    ];
    render(<TransactionTable items={items} />);

    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(2); // header + 1 data row
  });

  it("displays formatted date in locale format", () => {
    const items: DisplayTransaction[] = [
      {
        id: "1",
        description: "Groceries",
        date: "2024-01-20",
        amount: -200,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
    ];
    render(<TransactionTable items={items} />);

    const formattedDate = new Date("2024-01-20T00:00:00").toLocaleDateString("en-US");
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
  });

  it("displays date in muted color", () => {
    const items: DisplayTransaction[] = [
      {
        id: "1",
        description: "Groceries",
        date: "2024-01-20",
        amount: -200,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
    ];
    render(<TransactionTable items={items} />);

    const formattedDate = new Date("2024-01-20T00:00:00").toLocaleDateString("en-US");
    const dateCell = screen.getByText(formattedDate);
    expect(dateCell).toHaveClass("text-muted-foreground");
  });

  it("displays description", () => {
    const items: DisplayTransaction[] = [
      {
        id: "1",
        description: "Groceries",
        date: "2024-01-20",
        amount: -200,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
    ];
    render(<TransactionTable items={items} />);

    expect(screen.getByText("Groceries")).toBeInTheDocument();
  });

  it("displays recurring badge with Repeat icon when isRecurring is true", () => {
    const items: DisplayTransaction[] = [
      {
        id: "1",
        description: "Salary",
        date: "2024-01-15",
        amount: 5000,
        isProjected: true,
        isRecurring: true,
        editAction: mockEditAction,
      },
    ];
    render(<TransactionTable items={items} />);

    expect(screen.getByText("Recurring")).toBeInTheDocument();
  });

  it("does not show recurring badge when isRecurring is false", () => {
    const items: DisplayTransaction[] = [
      {
        id: "1",
        description: "Groceries",
        date: "2024-01-20",
        amount: -200,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
    ];
    render(<TransactionTable items={items} />);

    expect(screen.queryByText("Recurring")).not.toBeInTheDocument();
  });

  it("displays positive amounts in green with plus sign", () => {
    const items: DisplayTransaction[] = [
      {
        id: "1",
        description: "Salary",
        date: "2024-01-15",
        amount: 1000,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
    ];
    render(<TransactionTable items={items} />);

    const amount = screen.getByText("+$1,000.00");
    expect(amount).toHaveClass("text-green-600");
  });

  it("displays negative amounts in red with minus sign", () => {
    const items: DisplayTransaction[] = [
      {
        id: "1",
        description: "Groceries",
        date: "2024-01-20",
        amount: -200,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
    ];
    render(<TransactionTable items={items} />);

    const amount = screen.getByText("-$200.00");
    expect(amount).toHaveClass("text-red-600");
  });

  it("displays amount in monospace font", () => {
    const items: DisplayTransaction[] = [
      {
        id: "1",
        description: "Groceries",
        date: "2024-01-20",
        amount: -200,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
    ];
    render(<TransactionTable items={items} />);

    const amount = screen.getByText("-$200.00");
    expect(amount).toHaveClass("font-mono");
  });

  it("renders solid border on row by default", () => {
    const items: DisplayTransaction[] = [
      {
        id: "1",
        description: "Groceries",
        date: "2024-01-20",
        amount: -200,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
    ];
    const { container } = render(<TransactionTable items={items} />);

    const rows = container.querySelectorAll("[data-slot='table-row']");
    const dataRow = rows[1]; // Skip header row
    expect(dataRow).not.toHaveClass("border-dashed");
  });

  it("renders dashed border on row when projected", () => {
    const items: DisplayTransaction[] = [
      {
        id: "1",
        description: "Groceries",
        date: "2024-01-20",
        amount: -200,
        isProjected: true,
        isRecurring: false,
        editAction: mockEditAction,
      },
    ];
    const { container } = render(<TransactionTable items={items} />);

    const rows = container.querySelectorAll("[data-slot='table-row']");
    const dataRow = rows[1]; // Skip header row
    expect(dataRow).toHaveClass("border-dashed");
  });

  it("renders muted description text when projected", () => {
    const items: DisplayTransaction[] = [
      {
        id: "1",
        description: "Groceries",
        date: "2024-01-20",
        amount: -200,
        isProjected: true,
        isRecurring: false,
        editAction: mockEditAction,
      },
    ];
    render(<TransactionTable items={items} />);

    const description = screen.getByText("Groceries");
    expect(description).toHaveClass("text-muted-foreground");
  });

  it("renders editAction in actions column", () => {
    const items: DisplayTransaction[] = [
      {
        id: "1",
        description: "Groceries",
        date: "2024-01-20",
        amount: -200,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
    ];
    render(<TransactionTable items={items} />);

    expect(screen.getByLabelText("Edit")).toBeInTheDocument();
  });

  it("aligns date column left", () => {
    const items: DisplayTransaction[] = [
      {
        id: "1",
        description: "Groceries",
        date: "2024-01-20",
        amount: -200,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
    ];
    render(<TransactionTable items={items} />);

    const formattedDate = new Date("2024-01-20T00:00:00").toLocaleDateString("en-US");
    const dateCell = screen.getByText(formattedDate).closest("td");
    expect(dateCell).toHaveClass("text-left");
  });

  it("aligns description column left", () => {
    const items: DisplayTransaction[] = [
      {
        id: "1",
        description: "Groceries",
        date: "2024-01-20",
        amount: -200,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
    ];
    render(<TransactionTable items={items} />);

    const descriptionCell = screen.getByText("Groceries").closest("td");
    expect(descriptionCell).toHaveClass("text-left");
  });

  it("aligns amount column right", () => {
    const items: DisplayTransaction[] = [
      {
        id: "1",
        description: "Groceries",
        date: "2024-01-20",
        amount: -200,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
    ];
    render(<TransactionTable items={items} />);

    const amountCell = screen.getByText("-$200.00").closest("td");
    expect(amountCell).toHaveClass("text-right");
  });

  it("aligns actions column right", () => {
    const items: DisplayTransaction[] = [
      {
        id: "1",
        description: "Groceries",
        date: "2024-01-20",
        amount: -200,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
    ];
    render(<TransactionTable items={items} />);

    const actionCell = screen.getByLabelText("Edit").closest("td");
    expect(actionCell).toHaveClass("text-right");
  });

  it("renders multiple transactions", () => {
    const items: DisplayTransaction[] = [
      {
        id: "1",
        description: "Groceries",
        date: "2024-01-20",
        amount: -200,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
      {
        id: "2",
        description: "Salary",
        date: "2024-01-15",
        amount: 5000,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
    ];
    render(<TransactionTable items={items} />);

    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(3); // header + 2 data rows
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("Salary")).toBeInTheDocument();
  });

  it("sorts by date descending by default", () => {
    const items: DisplayTransaction[] = [
      {
        id: "1",
        description: "Groceries",
        date: "2024-01-15",
        amount: -200,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
      {
        id: "2",
        description: "Salary",
        date: "2024-01-20",
        amount: 5000,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
    ];
    render(<TransactionTable items={items} />);

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Salary"); // Latest first
    expect(rows[2]).toHaveTextContent("Groceries");
  });

  it("toggles sort direction when clicking same column", async () => {
    const user = userEvent.setup();
    const items: DisplayTransaction[] = [
      {
        id: "1",
        description: "Groceries",
        date: "2024-01-15",
        amount: -200,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
      {
        id: "2",
        description: "Salary",
        date: "2024-01-20",
        amount: 5000,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
    ];
    render(<TransactionTable items={items} />);

    const dateHeader = screen.getByRole("columnheader", { name: /Date/ });

    // Click to toggle to ascending
    await user.click(dateHeader);

    let rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Groceries"); // Earliest first
    expect(rows[2]).toHaveTextContent("Salary");

    // Click again to toggle back to descending
    await user.click(dateHeader);

    rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Salary"); // Latest first
    expect(rows[2]).toHaveTextContent("Groceries");
  });

  it("sorts by description when clicking description header", async () => {
    const user = userEvent.setup();
    const items: DisplayTransaction[] = [
      {
        id: "1",
        description: "Zebra",
        date: "2024-01-15",
        amount: -200,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
      {
        id: "2",
        description: "Apple",
        date: "2024-01-20",
        amount: 5000,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
    ];
    render(<TransactionTable items={items} />);

    const descriptionHeader = screen.getByRole("columnheader", { name: /Description/ });
    await user.click(descriptionHeader);

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Apple"); // Alphabetical
    expect(rows[2]).toHaveTextContent("Zebra");
  });

  it("sorts by amount when clicking amount header", async () => {
    const user = userEvent.setup();
    const items: DisplayTransaction[] = [
      {
        id: "1",
        description: "Large",
        date: "2024-01-15",
        amount: 5000,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
      {
        id: "2",
        description: "Small",
        date: "2024-01-20",
        amount: -200,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
    ];
    render(<TransactionTable items={items} />);

    const amountHeader = screen.getByRole("columnheader", { name: /Amount/ });
    await user.click(amountHeader);

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Small"); // Lowest first (ascending)
    expect(rows[2]).toHaveTextContent("Large");
  });

  it("maintains order when items have equal dates", () => {
    const items: DisplayTransaction[] = [
      {
        id: "1",
        description: "First",
        date: "2024-01-15",
        amount: 100,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
      {
        id: "2",
        description: "Second",
        date: "2024-01-15",
        amount: 200,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
    ];
    render(<TransactionTable items={items} />);

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("First");
    expect(rows[2]).toHaveTextContent("Second");
  });

  it("maintains order when items have equal descriptions", async () => {
    const user = userEvent.setup();
    const items: DisplayTransaction[] = [
      {
        id: "1",
        description: "Same",
        date: "2024-01-15",
        amount: 100,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
      {
        id: "2",
        description: "Same",
        date: "2024-01-20",
        amount: 200,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
    ];
    render(<TransactionTable items={items} />);

    const descriptionHeader = screen.getByRole("columnheader", { name: /Description/ });
    await user.click(descriptionHeader);

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("100");
    expect(rows[2]).toHaveTextContent("200");
  });

  it("maintains order when items have equal amounts", async () => {
    const user = userEvent.setup();
    const items: DisplayTransaction[] = [
      {
        id: "1",
        description: "First",
        date: "2024-01-15",
        amount: 100,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
      {
        id: "2",
        description: "Second",
        date: "2024-01-20",
        amount: 100,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
    ];
    render(<TransactionTable items={items} />);

    const amountHeader = screen.getByRole("columnheader", { name: /Amount/ });
    await user.click(amountHeader);

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("First");
    expect(rows[2]).toHaveTextContent("Second");
  });

  it("shows scenario icon when scenarioName is set", () => {
    const items: DisplayTransaction[] = [
      {
        id: "1",
        description: "New Car",
        date: "2024-01-15",
        amount: -30000,
        isProjected: false,
        isRecurring: false,
        scenarioName: "Early Retirement",
        editAction: mockEditAction,
      },
    ];
    render(
      <TooltipProvider>
        <TransactionTable items={items} />
      </TooltipProvider>
    );

    expect(screen.getByLabelText("Scenario: Early Retirement")).toBeInTheDocument();
  });

  it("does not show scenario icon when scenarioName is undefined", () => {
    const items: DisplayTransaction[] = [
      {
        id: "1",
        description: "Groceries",
        date: "2024-01-15",
        amount: -200,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
    ];
    render(
      <TooltipProvider>
        <TransactionTable items={items} />
      </TooltipProvider>
    );

    expect(screen.queryByLabelText(/^Scenario:/)).not.toBeInTheDocument();
  });

  it("shows tooltip content on hover", async () => {
    const user = userEvent.setup();
    const items: DisplayTransaction[] = [
      {
        id: "1",
        description: "New Car",
        date: "2024-01-15",
        amount: -30000,
        isProjected: false,
        isRecurring: false,
        scenarioName: "Early Retirement",
        editAction: mockEditAction,
      },
    ];
    render(
      <TooltipProvider>
        <TransactionTable items={items} />
      </TooltipProvider>
    );

    const scenarioIcon = screen.getByLabelText("Scenario: Early Retirement");
    await user.hover(scenarioIcon);

    expect(await screen.findByRole("tooltip")).toHaveTextContent("Early Retirement");
  });

  it("shows account column header by default", () => {
    render(<TransactionTable items={[]} />);
    expect(screen.getByRole("columnheader", { name: /Account/ })).toBeInTheDocument();
  });

  it("hides account column header when showAccountColumn is false", () => {
    render(<TransactionTable items={[]} showAccountColumn={false} />);
    expect(screen.queryByRole("columnheader", { name: /Account/ })).not.toBeInTheDocument();
  });

  it("hides account cell when showAccountColumn is false", () => {
    const items: DisplayTransaction[] = [
      {
        id: "1",
        description: "Groceries",
        accountName: "Checking",
        date: "2024-01-20",
        amount: -200,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
    ];
    render(<TransactionTable items={items} showAccountColumn={false} />);
    expect(screen.queryByText("Checking")).not.toBeInTheDocument();
  });

  it("shows account cell when showAccountColumn is true", () => {
    const items: DisplayTransaction[] = [
      {
        id: "1",
        description: "Groceries",
        accountName: "Checking",
        date: "2024-01-20",
        amount: -200,
        isProjected: false,
        isRecurring: false,
        editAction: mockEditAction,
      },
    ];
    render(<TransactionTable items={items} showAccountColumn={true} />);
    expect(screen.getByText("Checking")).toBeInTheDocument();
  });

  it("shows scenario icon alongside recurring badge when both apply", () => {
    const items: DisplayTransaction[] = [
      {
        id: "1",
        description: "Monthly Savings",
        date: "2024-01-15",
        amount: -500,
        isProjected: true,
        isRecurring: true,
        scenarioName: "Early Retirement",
        editAction: mockEditAction,
      },
    ];
    render(
      <TooltipProvider>
        <TransactionTable items={items} />
      </TooltipProvider>
    );

    expect(screen.getByText("Recurring")).toBeInTheDocument();
    expect(screen.getByLabelText("Scenario: Early Retirement")).toBeInTheDocument();
  });
});

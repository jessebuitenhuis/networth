import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { mockResizeObserver } from "@/test/mocks/mockResizeObserver";
import type { DisplayTransaction } from "@/transactions/DisplayTransaction.type";

import { TransactionTablePage } from "./TransactionTable.page";

mockResizeObserver();

describe("TransactionTable", () => {
  const mockEditAction = <button aria-label="Edit">Edit</button>;

  const makeItem = (overrides: Partial<DisplayTransaction> = {}): DisplayTransaction => ({
    id: "1",
    accountId: "a1",
    description: "Groceries",
    accountName: "",
    date: "2024-01-20",
    amount: -200,
    isProjected: false,
    isRecurring: false,
    editAction: mockEditAction,
    ...overrides,
  });

  it("renders table headers", () => {
    const page = TransactionTablePage.render({ items: [] });

    expect(page.dateHeader).toBeInTheDocument();
    expect(page.descriptionHeader).toBeInTheDocument();
    expect(page.amountHeader).toBeInTheDocument();
    expect(page.actionsHeader).toBeInTheDocument();
  });

  it("renders transaction rows", () => {
    const page = TransactionTablePage.render({ items: [makeItem()] });

    expect(page.rows).toHaveLength(2); // header + 1 data row
  });

  it("displays formatted date in locale format", () => {
    TransactionTablePage.render({ items: [makeItem({ date: "2024-01-20" })] });

    const formattedDate = new Date("2024-01-20T00:00:00").toLocaleDateString("en-US");
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
  });

  it("displays date in muted color", () => {
    TransactionTablePage.render({ items: [makeItem({ date: "2024-01-20" })] });

    const formattedDate = new Date("2024-01-20T00:00:00").toLocaleDateString("en-US");
    expect(screen.getByText(formattedDate)).toHaveClass("text-muted-foreground");
  });

  it("displays description", () => {
    TransactionTablePage.render({ items: [makeItem({ description: "Groceries" })] });

    expect(screen.getByText("Groceries")).toBeInTheDocument();
  });

  it("displays recurring badge with Repeat icon when isRecurring is true", () => {
    const page = TransactionTablePage.render({
      items: [makeItem({ isRecurring: true })],
    });

    expect(page.recurringBadge).toBeInTheDocument();
  });

  it("does not show recurring badge when isRecurring is false", () => {
    const page = TransactionTablePage.render({
      items: [makeItem({ isRecurring: false })],
    });

    expect(page.queryRecurringBadge()).not.toBeInTheDocument();
  });

  it("displays positive amounts in green with plus sign", () => {
    TransactionTablePage.render({ items: [makeItem({ amount: 1000 })] });

    const amount = screen.getByText("+$1,000.00");
    expect(amount).toHaveClass("text-green-600");
  });

  it("displays negative amounts in red with minus sign", () => {
    TransactionTablePage.render({ items: [makeItem({ amount: -200 })] });

    const amount = screen.getByText("-$200.00");
    expect(amount).toHaveClass("text-red-600");
  });

  it("displays amount in monospace font", () => {
    TransactionTablePage.render({ items: [makeItem({ amount: -200 })] });

    const amount = screen.getByText("-$200.00");
    expect(amount).toHaveClass("font-mono");
  });

  it("renders solid border on row by default", () => {
    const page = TransactionTablePage.render({ items: [makeItem()] });

    expect(page.getDataRow(0)).not.toHaveClass("border-dashed");
  });

  it("renders dashed border on row when projected", () => {
    const page = TransactionTablePage.render({
      items: [makeItem({ isProjected: true })],
    });

    expect(page.getDataRow(0)).toHaveClass("border-dashed");
  });

  it("renders muted description text when projected", () => {
    TransactionTablePage.render({
      items: [makeItem({ description: "Groceries", isProjected: true })],
    });

    expect(screen.getByText("Groceries")).toHaveClass("text-muted-foreground");
  });

  it("renders editAction in actions column", () => {
    TransactionTablePage.render({ items: [makeItem()] });

    expect(screen.getByLabelText("Edit")).toBeInTheDocument();
  });

  it("aligns date column left", () => {
    TransactionTablePage.render({ items: [makeItem({ date: "2024-01-20" })] });

    const formattedDate = new Date("2024-01-20T00:00:00").toLocaleDateString("en-US");
    const dateCell = screen.getByText(formattedDate).closest("td");
    expect(dateCell).toHaveClass("text-left");
  });

  it("aligns description column left", () => {
    TransactionTablePage.render({ items: [makeItem({ description: "Groceries" })] });

    const descriptionCell = screen.getByText("Groceries").closest("td");
    expect(descriptionCell).toHaveClass("text-left");
  });

  it("aligns amount column right", () => {
    TransactionTablePage.render({ items: [makeItem({ amount: -200 })] });

    const amountCell = screen.getByText("-$200.00").closest("td");
    expect(amountCell).toHaveClass("text-right");
  });

  it("aligns actions column right", () => {
    TransactionTablePage.render({ items: [makeItem()] });

    const actionCell = screen.getByLabelText("Edit").closest("td");
    expect(actionCell).toHaveClass("text-right");
  });

  it("renders multiple transactions", () => {
    const page = TransactionTablePage.render({
      items: [
        makeItem({ id: "1", description: "Groceries" }),
        makeItem({ id: "2", description: "Salary" }),
      ],
    });

    expect(page.rows).toHaveLength(3); // header + 2 data rows
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("Salary")).toBeInTheDocument();
  });

  it("sorts by date descending by default", () => {
    const page = TransactionTablePage.render({
      items: [
        makeItem({ id: "1", description: "Groceries", date: "2024-01-15" }),
        makeItem({ id: "2", description: "Salary", date: "2024-01-20" }),
      ],
    });

    expect(page.getDataRow(0)).toHaveTextContent("Salary"); // Latest first
    expect(page.getDataRow(1)).toHaveTextContent("Groceries");
  });

  it("toggles sort direction when clicking same column", async () => {
    const page = TransactionTablePage.render({
      items: [
        makeItem({ id: "1", description: "Groceries", date: "2024-01-15" }),
        makeItem({ id: "2", description: "Salary", date: "2024-01-20" }),
      ],
    });

    // Click to toggle to ascending
    await page.sortByDate();

    expect(page.getDataRow(0)).toHaveTextContent("Groceries"); // Earliest first
    expect(page.getDataRow(1)).toHaveTextContent("Salary");

    // Click again to toggle back to descending
    await page.sortByDate();

    expect(page.getDataRow(0)).toHaveTextContent("Salary"); // Latest first
    expect(page.getDataRow(1)).toHaveTextContent("Groceries");
  });

  it("sorts by description when clicking description header", async () => {
    const page = TransactionTablePage.render({
      items: [
        makeItem({ id: "1", description: "Zebra", date: "2024-01-15" }),
        makeItem({ id: "2", description: "Apple", date: "2024-01-20" }),
      ],
    });

    await page.sortByDescription();

    expect(page.getDataRow(0)).toHaveTextContent("Apple"); // Alphabetical
    expect(page.getDataRow(1)).toHaveTextContent("Zebra");
  });

  it("sorts by amount when clicking amount header", async () => {
    const page = TransactionTablePage.render({
      items: [
        makeItem({ id: "1", description: "Large", date: "2024-01-15", amount: 5000 }),
        makeItem({ id: "2", description: "Small", date: "2024-01-20", amount: -200 }),
      ],
    });

    await page.sortByAmount();

    expect(page.getDataRow(0)).toHaveTextContent("Small"); // Lowest first (ascending)
    expect(page.getDataRow(1)).toHaveTextContent("Large");
  });

  it("maintains order when items have equal dates", () => {
    const page = TransactionTablePage.render({
      items: [
        makeItem({ id: "1", description: "First", date: "2024-01-15", amount: 100 }),
        makeItem({ id: "2", description: "Second", date: "2024-01-15", amount: 200 }),
      ],
    });

    expect(page.getDataRow(0)).toHaveTextContent("First");
    expect(page.getDataRow(1)).toHaveTextContent("Second");
  });

  it("maintains order when items have equal descriptions", async () => {
    const page = TransactionTablePage.render({
      items: [
        makeItem({ id: "1", description: "Same", date: "2024-01-15", amount: 100 }),
        makeItem({ id: "2", description: "Same", date: "2024-01-20", amount: 200 }),
      ],
    });

    await page.sortByDescription();

    expect(page.getDataRow(0)).toHaveTextContent("100");
    expect(page.getDataRow(1)).toHaveTextContent("200");
  });

  it("maintains order when items have equal amounts", async () => {
    const page = TransactionTablePage.render({
      items: [
        makeItem({ id: "1", description: "First", date: "2024-01-15", amount: 100 }),
        makeItem({ id: "2", description: "Second", date: "2024-01-20", amount: 100 }),
      ],
    });

    await page.sortByAmount();

    expect(page.getDataRow(0)).toHaveTextContent("First");
    expect(page.getDataRow(1)).toHaveTextContent("Second");
  });

  it("shows scenario icon when scenarioName is set", () => {
    const page = TransactionTablePage.render({
      items: [makeItem({ scenarioName: "Early Retirement" })],
      withTooltipProvider: true,
    });

    expect(page.getScenarioIcon("Early Retirement")).toBeInTheDocument();
  });

  it("does not show scenario icon when scenarioName is undefined", () => {
    const page = TransactionTablePage.render({
      items: [makeItem()],
      withTooltipProvider: true,
    });

    expect(page.queryScenarioIcon()).not.toBeInTheDocument();
  });

  it("shows tooltip content on hover", async () => {
    const page = TransactionTablePage.render({
      items: [makeItem({ scenarioName: "Early Retirement" })],
      withTooltipProvider: true,
    });

    await page.hoverScenarioIcon("Early Retirement");

    expect(await screen.findByRole("tooltip")).toHaveTextContent("Early Retirement");
  });

  it("shows account column header by default", () => {
    const page = TransactionTablePage.render({ items: [] });

    expect(page.accountHeader).toBeInTheDocument();
  });

  it("hides account column header when showAccountColumn is false", () => {
    const page = TransactionTablePage.render({ items: [], showAccountColumn: false });

    expect(page.queryAccountHeader()).not.toBeInTheDocument();
  });

  it("hides account cell when showAccountColumn is false", () => {
    TransactionTablePage.render({
      items: [makeItem({ accountName: "Checking" })],
      showAccountColumn: false,
    });

    expect(screen.queryByText("Checking")).not.toBeInTheDocument();
  });

  it("shows account cell when showAccountColumn is true", () => {
    TransactionTablePage.render({
      items: [makeItem({ accountName: "Checking" })],
      showAccountColumn: true,
    });

    expect(screen.getByText("Checking")).toBeInTheDocument();
  });

  it("shows scenario icon alongside recurring badge when both apply", () => {
    const page = TransactionTablePage.render({
      items: [makeItem({ isRecurring: true, isProjected: true, scenarioName: "Early Retirement" })],
      withTooltipProvider: true,
    });

    expect(page.recurringBadge).toBeInTheDocument();
    expect(page.getScenarioIcon("Early Retirement")).toBeInTheDocument();
  });
});

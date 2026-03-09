import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockApiResponses } from "@/test/mocks/mockApiResponses";

import { CategoryRowPage, createCategory } from "./CategoryRow.page";

describe("CategoryRow", () => {
  beforeEach(() => {
    mockApiResponses();
  });

  const defaultProps = () => ({
    category: createCategory({ id: "1", name: "Food" }),
    depth: 0,
    onAddSubcategory: vi.fn(),
    onDragStart: vi.fn(),
    onDrop: vi.fn(),
    isDragOver: false,
    onDragOver: vi.fn(),
    onDragLeave: vi.fn(),
  });

  it("renders category name", () => {
    const page = CategoryRowPage.render(defaultProps());
    expect(page.getByText("Food")).toBeInTheDocument();
  });

  it.each([
    { depth: 0, expectedPadding: "0px" },
    { depth: 1, expectedPadding: "24px" },
    { depth: 2, expectedPadding: "48px" },
  ])("renders with padding-left $expectedPadding at depth $depth", ({ depth, expectedPadding }) => {
    const page = CategoryRowPage.render({ ...defaultProps(), depth });
    expect(page.row.style.paddingLeft).toBe(expectedPadding);
  });

  it("has edit and add-subcategory buttons in DOM", () => {
    const page = CategoryRowPage.render(defaultProps());
    expect(page.queryEditButton()).toBeInTheDocument();
    expect(page.queryAddButton()).toBeInTheDocument();
  });

  it("calls onAddSubcategory with category id when add button clicked", async () => {
    const props = defaultProps();
    const page = CategoryRowPage.render(props);
    await page.hoverRow();
    await page.click(page.queryAddButton()!);
    expect(props.onAddSubcategory).toHaveBeenCalledWith("1");
  });

  it("is draggable", () => {
    const page = CategoryRowPage.render(defaultProps());
    expect(page.row).toHaveAttribute("draggable", "true");
  });

  it("calls onDragStart on drag start", () => {
    const props = defaultProps();
    const page = CategoryRowPage.render(props);
    page.dragStart();
    expect(props.onDragStart).toHaveBeenCalledWith("1");
  });

  it("calls onDrop on drop", () => {
    const props = defaultProps();
    const page = CategoryRowPage.render(props);
    page.drop();
    expect(props.onDrop).toHaveBeenCalledWith("1");
  });

  it("calls onDragOver on drag over", () => {
    const props = defaultProps();
    const page = CategoryRowPage.render(props);
    page.dragOver();
    expect(props.onDragOver).toHaveBeenCalledWith("1");
  });

  it("calls onDragLeave on drag leave", () => {
    const props = defaultProps();
    const page = CategoryRowPage.render(props);
    page.dragLeave();
    expect(props.onDragLeave).toHaveBeenCalled();
  });

  it("shows visual highlight when isDragOver is true", () => {
    const page = CategoryRowPage.render({ ...defaultProps(), isDragOver: true });
    expect(page.row.className).toMatch(/bg-accent/);
  });

  it("does not show highlight when isDragOver is false", () => {
    const page = CategoryRowPage.render({ ...defaultProps(), isDragOver: false });
    expect(page.row.className).not.toMatch(/bg-accent/);
  });
});

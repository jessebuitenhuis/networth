import { describe, expect, it, vi } from "vitest";

import { InlineCreateSubcategoryPage } from "./InlineCreateSubcategory.page";

describe("InlineCreateSubcategory", () => {
  const defaultProps = () => ({
    parentCategoryId: "parent-1",
    onCreate: vi.fn(),
    onCancel: vi.fn(),
    depth: 1,
  });

  it("renders input with focus", () => {
    const page = InlineCreateSubcategoryPage.render(defaultProps());
    expect(page.nameInput).toHaveFocus();
  });

  it("has create button disabled when name is empty", () => {
    const page = InlineCreateSubcategoryPage.render(defaultProps());
    expect(page.createButton).toBeDisabled();
  });

  it("enables create button when name is entered", async () => {
    const page = InlineCreateSubcategoryPage.render(defaultProps());
    await page.typeName("Groceries");
    expect(page.createButton).not.toBeDisabled();
  });

  it("calls onCreate with name and parentCategoryId on Enter", async () => {
    const props = defaultProps();
    const page = InlineCreateSubcategoryPage.render(props);
    await page.typeName("Groceries");
    await page.pressEnter();
    expect(props.onCreate).toHaveBeenCalledWith("Groceries", "parent-1");
  });

  it("calls onCancel on Escape", async () => {
    const props = defaultProps();
    const page = InlineCreateSubcategoryPage.render(props);
    await page.pressEscape();
    expect(props.onCancel).toHaveBeenCalled();
  });

  it("calls onCreate on Create button click", async () => {
    const props = defaultProps();
    const page = InlineCreateSubcategoryPage.render(props);
    await page.typeName("Dining");
    await page.clickCreate();
    expect(props.onCreate).toHaveBeenCalledWith("Dining", "parent-1");
  });

  it("does not call onCreate when name is empty and Enter pressed", async () => {
    const props = defaultProps();
    const page = InlineCreateSubcategoryPage.render(props);
    await page.pressEnter();
    expect(props.onCreate).not.toHaveBeenCalled();
  });

  it("trims whitespace from name", async () => {
    const props = defaultProps();
    const page = InlineCreateSubcategoryPage.render(props);
    await page.typeName("  Groceries  ");
    await page.pressEnter();
    expect(props.onCreate).toHaveBeenCalledWith("Groceries", "parent-1");
  });

  it("renders at correct indentation", () => {
    const page = InlineCreateSubcategoryPage.render({ ...defaultProps(), depth: 2 });
    const container = page.nameInput.closest("[style]");
    expect(container).toHaveStyle({ paddingLeft: "72px" });
  });
});

import { beforeEach, describe, expect, it } from "vitest";

import { mockApiResponses } from "@/test/mocks/mockApiResponses";

import { CategoryListPage } from "./CategoryList.page";

const rootCategory = { id: "1", name: "Housing" };
const childCategory = { id: "2", name: "Mortgage", parentCategoryId: "1" };
const secondRoot = { id: "3", name: "Income" };

describe("CategoryList", () => {
  beforeEach(() => {
    mockApiResponses();
  });

  describe("structure", () => {
    it("renders without a Card wrapper", () => {
      const page = CategoryListPage.render([rootCategory]);
      expect(page.queryCard()).not.toBeInTheDocument();
    });

    it("renders empty state without a Card wrapper", () => {
      const page = CategoryListPage.render([]);
      expect(page.emptyMessage).toBeInTheDocument();
      expect(page.queryCard()).not.toBeInTheDocument();
    });

    it("does not render a 'Categories' heading", () => {
      const page = CategoryListPage.render([rootCategory]);
      expect(page.queryHeading("Categories")).not.toBeInTheDocument();
    });
  });

  describe("hover actions", () => {
    it("renders edit button with hover-only visibility class", () => {
      const page = CategoryListPage.render([rootCategory]);
      const actions = page.getActionsContainer("Housing");
      expect(actions.className).toMatch(/opacity-0/);
      expect(actions.className).toMatch(/group-hover\/cat:opacity-100/);
    });

    it("renders add-subcategory button with hover-only visibility class", () => {
      const page = CategoryListPage.render([rootCategory]);
      expect(page.getAddSubcategoryButton("Housing")).toBeInTheDocument();
    });
  });

  describe("inline subcategory creation", () => {
    it("shows inline input when add-subcategory is clicked", async () => {
      const page = CategoryListPage.render([rootCategory]);
      await page.clickAddSubcategory("Housing");
      expect(page.getInlineInput()).toBeInTheDocument();
    });

    it("hides inline input on Escape", async () => {
      const page = CategoryListPage.render([rootCategory]);
      await page.clickAddSubcategory("Housing");
      await page.cancelInlineForm();
      expect(page.queryInlineInput()).not.toBeInTheDocument();
    });

    it("creates subcategory on Enter and hides input", async () => {
      const page = CategoryListPage.render([rootCategory]);
      await page.clickAddSubcategory("Housing");
      await page.typeSubcategoryName("Rent");
      await page.submitInlineForm();
      expect(page.queryInlineInput()).not.toBeInTheDocument();
    });

    it("does not create subcategory on Enter with empty name", async () => {
      const page = CategoryListPage.render([rootCategory]);
      await page.clickAddSubcategory("Housing");
      await page.submitInlineForm();
      expect(page.getInlineInput()).toBeInTheDocument();
    });
  });

  describe("drag to reparent", () => {
    it("makes each category draggable", () => {
      const page = CategoryListPage.render([rootCategory, secondRoot]);
      expect(page.isDraggable("Housing")).toBe(true);
      expect(page.isDraggable("Income")).toBe(true);
    });

    it("makes child categories draggable", () => {
      const page = CategoryListPage.render([rootCategory, childCategory]);
      expect(page.isDraggable("Mortgage")).toBe(true);
    });
  });
});

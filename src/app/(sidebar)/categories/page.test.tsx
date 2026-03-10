import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { CategoryProvider } from "@/categories/CategoryContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { mockApiResponses } from "@/test/mocks/mockApiResponses";

import CategoriesPage from "./page";

describe("CategoriesPage", () => {
  beforeEach(() => {
    mockApiResponses();
  });

  function renderPage() {
    render(
      <SidebarProvider>
        <CategoryProvider>
          <CategoriesPage />
        </CategoryProvider>
      </SidebarProvider>,
    );
  }

  it("renders page title", () => {
    renderPage();
    expect(screen.getByText("Categories")).toBeInTheDocument();
  });

  it("renders create category button", () => {
    renderPage();
    expect(
      screen.getByRole("button", { name: /add category/i }),
    ).toBeInTheDocument();
  });

  it("renders empty state when no categories", () => {
    renderPage();
    expect(screen.getByText(/no categories yet/i)).toBeInTheDocument();
  });
});

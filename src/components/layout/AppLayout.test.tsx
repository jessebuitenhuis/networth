import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppLayout } from "./AppLayout";
import type { NavGroup } from "./NavGroup";

const testGroups: NavGroup[] = [
  {
    label: "Main",
    items: [{ title: "Dashboard", url: "/dashboard" }],
  },
];

function renderWithProvider(navGroups: NavGroup[], children: React.ReactNode) {
  return render(
    <SidebarProvider>
      <AppLayout navGroups={navGroups}>{children}</AppLayout>
    </SidebarProvider>
  );
}

describe("AppLayout", () => {
  it("renders children in main content area", () => {
    renderWithProvider(testGroups, <p>Page content</p>);

    expect(screen.getByText("Page content")).toBeInTheDocument();
  });

  it("renders sidebar trigger button", () => {
    renderWithProvider(testGroups, <p>Content</p>);

    expect(
      document.querySelector('[data-slot="sidebar-trigger"]')
    ).toBeInTheDocument();
  });

  it("renders sidebar with nav items", () => {
    renderWithProvider(testGroups, <p>Content</p>);

    expect(
      screen.getByRole("link", { name: "Dashboard" })
    ).toBeInTheDocument();
  });
});

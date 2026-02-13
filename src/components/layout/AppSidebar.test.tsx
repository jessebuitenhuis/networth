import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SidebarProvider } from "@/components/ui/sidebar";

import { AppSidebar } from "./AppSidebar";
import type { NavGroup } from "./NavGroup.type";

function renderWithProvider(navGroups: NavGroup[]) {
  return render(
    <SidebarProvider>
      <AppSidebar navGroups={navGroups} />
    </SidebarProvider>
  );
}

const testGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", url: "/dashboard" },
      { title: "Accounts", url: "/accounts", isActive: true },
    ],
  },
  {
    label: "Settings",
    items: [{ title: "Profile", url: "/profile" }],
  },
];

describe("AppSidebar", () => {
  it("renders all nav group labels", () => {
    renderWithProvider(testGroups);

    expect(screen.getByText("Main")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders all nav items as links with correct hrefs", () => {
    renderWithProvider(testGroups);

    const dashboard = screen.getByRole("link", { name: "Dashboard" });
    expect(dashboard).toHaveAttribute("href", "/dashboard");

    const accounts = screen.getByRole("link", { name: "Accounts" });
    expect(accounts).toHaveAttribute("href", "/accounts");

    const profile = screen.getByRole("link", { name: "Profile" });
    expect(profile).toHaveAttribute("href", "/profile");
  });

  it("renders group action when provided", () => {
    const groups: NavGroup[] = [
      {
        label: "Accounts",
        items: [],
        action: <button>+</button>,
      },
    ];
    renderWithProvider(groups);

    expect(screen.getByRole("button", { name: "+" })).toBeInTheDocument();
  });

  it("renders item action only on hover", () => {
    const groups: NavGroup[] = [
      {
        label: "Accounts",
        items: [
          {
            title: "Checking",
            url: "/accounts/1",
            action: <button>Edit</button>,
          },
        ],
      },
    ];
    renderWithProvider(groups);

    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();

    const checkingLink = screen.getByRole("link", { name: "Checking" });
    const listItem = checkingLink.closest('[data-slot="sidebar-menu-item"]')!;
    fireEvent.mouseEnter(listItem);

    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("handles empty nav groups", () => {
    renderWithProvider([]);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders item icon when provided", () => {
    const groups: NavGroup[] = [
      {
        label: "Main",
        items: [
          {
            title: "Dashboard",
            url: "/",
            icon: <span data-testid="dashboard-icon">📊</span>,
          },
        ],
      },
    ];
    renderWithProvider(groups);

    expect(screen.getByTestId("dashboard-icon")).toBeInTheDocument();
  });

  it("renders app name in sidebar header", () => {
    renderWithProvider(testGroups);

    expect(screen.getByText("Net Worth")).toBeInTheDocument();
  });

  it("renders money icon in sidebar header", () => {
    const { container } = renderWithProvider(testGroups);

    const header = container.querySelector("[data-slot='sidebar-header']");
    expect(header).toBeInTheDocument();

    const icon = header?.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("does not render toggle in sidebar header", () => {
    const { container } = renderWithProvider(testGroups);

    const header = container.querySelector("[data-slot='sidebar-header']");
    expect(header).toBeInTheDocument();

    const trigger = header?.querySelector("[data-slot='sidebar-trigger']");
    expect(trigger).not.toBeInTheDocument();
  });

  it("renders labelSuffix next to group label", () => {
    const groups: NavGroup[] = [
      {
        label: "Accounts",
        labelSuffix: "US$250K",
        items: [],
      },
    ];
    renderWithProvider(groups);

    expect(screen.getByText("Accounts")).toBeInTheDocument();
    expect(screen.getByText("US$250K")).toBeInTheDocument();
  });

  it("renders subtitle next to item title", () => {
    const groups: NavGroup[] = [
      {
        label: "Accounts",
        items: [
          {
            title: "Checking",
            url: "/accounts/1",
            subtitle: "US$1.5K",
          },
        ],
      },
    ];
    renderWithProvider(groups);

    expect(screen.getByText("Checking")).toBeInTheDocument();
    expect(screen.getByText("US$1.5K")).toBeInTheDocument();
  });

  it("renders footerAction below items", () => {
    const groups: NavGroup[] = [
      {
        label: "Accounts",
        items: [{ title: "Checking", url: "/accounts/1" }],
        footerAction: <button>New Account</button>,
      },
    ];
    renderWithProvider(groups);

    expect(screen.getByRole("button", { name: "New Account" })).toBeInTheDocument();
  });
});

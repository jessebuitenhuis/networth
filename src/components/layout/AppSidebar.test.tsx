import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import type { NavGroup } from "./NavGroup";

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

  it("renders item action when provided", () => {
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

    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("handles empty nav groups", () => {
    renderWithProvider([]);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});

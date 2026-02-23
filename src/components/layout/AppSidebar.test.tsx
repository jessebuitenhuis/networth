import { describe, expect, it } from "vitest";

import type { NavGroup } from "./NavGroup.type";
import { AppSidebarPage } from "./AppSidebar.page";

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
    const page = AppSidebarPage.render(testGroups);

    expect(page.getText("Main")).toBeInTheDocument();
    expect(page.getText("Settings")).toBeInTheDocument();
  });

  it("renders all nav items as links with correct hrefs", () => {
    const page = AppSidebarPage.render(testGroups);

    expect(page.getLink("Dashboard")).toHaveAttribute("href", "/dashboard");
    expect(page.getLink("Accounts")).toHaveAttribute("href", "/accounts");
    expect(page.getLink("Profile")).toHaveAttribute("href", "/profile");
  });

  it("renders group action when provided", () => {
    const groups: NavGroup[] = [
      {
        label: "Accounts",
        items: [],
        action: <button>+</button>,
      },
    ];
    const page = AppSidebarPage.render(groups);

    expect(page.getButton("+")).toBeInTheDocument();
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
    const page = AppSidebarPage.render(groups);

    expect(page.queryButton("Edit")).not.toBeInTheDocument();

    page.hoverItem("Checking");

    expect(page.getButton("Edit")).toBeInTheDocument();
  });

  it("handles empty nav groups", () => {
    const page = AppSidebarPage.render([]);

    expect(page.queryLink()).not.toBeInTheDocument();
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
    const page = AppSidebarPage.render(groups);

    expect(page.getTestId("dashboard-icon")).toBeInTheDocument();
  });

  it("renders app name in sidebar header", () => {
    const page = AppSidebarPage.render(testGroups);

    expect(page.getText("Net Worth")).toBeInTheDocument();
  });

  it("renders money icon in sidebar header", () => {
    const page = AppSidebarPage.render(testGroups);

    const icon = page.sidebarHeader?.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("does not render toggle in sidebar header", () => {
    const page = AppSidebarPage.render(testGroups);

    const trigger = page.sidebarHeader?.querySelector("[data-slot='sidebar-trigger']");
    expect(trigger).not.toBeInTheDocument();
  });

  it("renders labelSuffix next to group label", () => {
    const groups: NavGroup[] = [
      {
        label: "Accounts",
        labelSuffix: "$250K",
        items: [],
      },
    ];
    const page = AppSidebarPage.render(groups);

    expect(page.getText("Accounts")).toBeInTheDocument();
    expect(page.getText("$250K")).toBeInTheDocument();
  });

  it("renders subtitle next to item title", () => {
    const groups: NavGroup[] = [
      {
        label: "Accounts",
        items: [
          {
            title: "Checking",
            url: "/accounts/1",
            subtitle: "$1.5K",
          },
        ],
      },
    ];
    const page = AppSidebarPage.render(groups);

    expect(page.getText("Checking")).toBeInTheDocument();
    expect(page.getText("$1.5K")).toBeInTheDocument();
  });

  it("renders footerAction below items", () => {
    const groups: NavGroup[] = [
      {
        label: "Accounts",
        items: [{ title: "Checking", url: "/accounts/1" }],
        footerAction: <button>New Account</button>,
      },
    ];
    const page = AppSidebarPage.render(groups);

    expect(page.getButton("New Account")).toBeInTheDocument();
  });
});

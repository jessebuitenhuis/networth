import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AccountProvider } from "@/context/AccountContext";
import { TransactionProvider } from "@/context/TransactionContext";
import { AppLayout } from "./AppLayout";
import type { NavGroup } from "./NavGroup";
import { AccountType } from "@/models/AccountType";
import type { Account } from "@/models/Account";

const testGroups: NavGroup[] = [
  {
    label: "Main",
    items: [{ title: "Dashboard", url: "/dashboard" }],
  },
];

function renderWithProvider(navGroups: NavGroup[], children: React.ReactNode) {
  return render(
    <SidebarProvider>
      <AccountProvider>
        <TransactionProvider>
          <AppLayout navGroups={navGroups}>{children}</AppLayout>
        </TransactionProvider>
      </AccountProvider>
    </SidebarProvider>
  );
}

describe("AppLayout", () => {
  beforeEach(() => localStorage.clear());

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

  it("renders Accounts nav group when accounts exist", async () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
      { id: "2", name: "Savings", type: AccountType.Asset },
    ];
    localStorage.setItem("accounts", JSON.stringify(accounts));

    renderWithProvider(testGroups, <p>Content</p>);

    expect(await screen.findByText("Accounts")).toBeInTheDocument();
    expect(screen.getByText("Checking")).toBeInTheDocument();
    expect(screen.getByText("Savings")).toBeInTheDocument();
  });

  it("links accounts to /accounts/:id", async () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
    ];
    localStorage.setItem("accounts", JSON.stringify(accounts));

    renderWithProvider(testGroups, <p>Content</p>);

    const link = await screen.findByRole("link", { name: "Checking" });
    expect(link).toHaveAttribute("href", "/accounts/1");
  });

  it("renders Accounts nav group even when no accounts exist", () => {
    renderWithProvider(testGroups, <p>Content</p>);

    expect(screen.getByText("Accounts")).toBeInTheDocument();
  });

  it("renders add account button in Accounts group", () => {
    renderWithProvider(testGroups, <p>Content</p>);

    expect(
      screen.getByRole("button", { name: "Add Account" })
    ).toBeInTheDocument();
  });
});

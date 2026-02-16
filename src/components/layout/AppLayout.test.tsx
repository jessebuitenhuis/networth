import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SidebarProvider } from "@/components/ui/sidebar";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));
import type { Account } from "@/accounts/Account.type";
import { AccountType } from "@/accounts/AccountType";
import { AccountProvider } from "@/context/AccountContext";
import { RecurringTransactionProvider } from "@/context/RecurringTransactionContext";
import { ScenarioProvider } from "@/context/ScenarioContext";
import { TransactionProvider } from "@/context/TransactionContext";

import { AppLayout } from "./AppLayout";
import type { NavGroup } from "./NavGroup.type";

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
          <ScenarioProvider>
            <RecurringTransactionProvider>
              <AppLayout navGroups={navGroups}>{children}</AppLayout>
            </RecurringTransactionProvider>
          </ScenarioProvider>
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

    const link = await screen.findByRole("link", { name: /Checking/ });
    expect(link).toHaveAttribute("href", "/accounts/1");
  });

  it("renders Accounts nav group even when no accounts exist", () => {
    renderWithProvider(testGroups, <p>Content</p>);

    expect(screen.getByText("Accounts")).toBeInTheDocument();
  });

  it("renders add account button in Accounts group", () => {
    renderWithProvider(testGroups, <p>Content</p>);

    expect(
      screen.getByRole("button", { name: /New Account/i })
    ).toBeInTheDocument();
  });

  it("renders AccountIcon for each account nav item", async () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
      { id: "2", name: "Credit Card", type: AccountType.Liability },
    ];
    localStorage.setItem("accounts", JSON.stringify(accounts));

    renderWithProvider(testGroups, <p>Content</p>);

    const checkingIcon = await screen.findByText("CH");
    expect(checkingIcon).toBeInTheDocument();
    expect(checkingIcon).toHaveClass("bg-zinc-800");

    const creditIcon = screen.getByText("CR");
    expect(creditIcon).toBeInTheDocument();
    expect(creditIcon).toHaveClass("bg-zinc-800");
  });

  it("shows abbreviated balance next to each account name", async () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
      { id: "2", name: "Savings", type: AccountType.Asset },
    ];
    const transactions = [
      {
        id: "t1",
        accountId: "1",
        description: "Initial",
        amount: 1500,
        date: "2024-01-01",
        scenarioIds: [],
      },
      {
        id: "t2",
        accountId: "2",
        description: "Initial",
        amount: 250000,
        date: "2024-01-01",
        scenarioIds: [],
      },
    ];
    localStorage.setItem("accounts", JSON.stringify(accounts));
    localStorage.setItem("transactions", JSON.stringify(transactions));

    renderWithProvider(testGroups, <p>Content</p>);

    expect(await screen.findByText("US$1.5K")).toBeInTheDocument();
    expect(screen.getByText("US$250K")).toBeInTheDocument();
  });

  it("shows total net worth next to Accounts label", async () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
      { id: "2", name: "Credit Card", type: AccountType.Liability },
    ];
    const transactions = [
      {
        id: "t1",
        accountId: "1",
        description: "Initial",
        amount: 5000,
        date: "2024-01-01",
        scenarioIds: [],
      },
      {
        id: "t2",
        accountId: "2",
        description: "Initial",
        amount: 1000,
        date: "2024-01-01",
        scenarioIds: [],
      },
    ];
    localStorage.setItem("accounts", JSON.stringify(accounts));
    localStorage.setItem("transactions", JSON.stringify(transactions));

    renderWithProvider(testGroups, <p>Content</p>);

    expect(await screen.findByText("US$4K")).toBeInTheDocument();
  });

  it("renders New Account as a muted link at the bottom of account list", () => {
    renderWithProvider(testGroups, <p>Content</p>);

    const newAccountLink = screen.getByRole("button", { name: /New Account/i });
    expect(newAccountLink).toBeInTheDocument();
    expect(newAccountLink).toHaveClass("text-muted-foreground");
  });
});

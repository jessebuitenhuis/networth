import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

import type { Account } from "@/accounts/Account.type";
import { AccountType } from "@/accounts/AccountType";
import { mockApiResponses } from "@/test/mocks/mockApiResponses";
import type { Transaction } from "@/transactions/Transaction.type";

import { AppLayoutPage } from "./AppLayout.page";
import type { NavGroup } from "./NavGroup.type";

const testGroups: NavGroup[] = [
  {
    label: "Main",
    items: [{ title: "Dashboard", url: "/dashboard" }],
  },
];

describe("AppLayout", () => {
  beforeEach(() => {
    mockApiResponses();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children in main content area", () => {
    const page = AppLayoutPage.render(testGroups, <p>Page content</p>);

    expect(page.getText("Page content")).toBeInTheDocument();
  });

  it("renders sidebar with nav items", () => {
    const page = AppLayoutPage.render(testGroups, <p>Content</p>);

    expect(page.getLink("Dashboard")).toBeInTheDocument();
  });

  it("renders Accounts nav group when accounts exist", async () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
      { id: "2", name: "Savings", type: AccountType.Asset },
    ];
    mockApiResponses({ accounts });

    const page = AppLayoutPage.render(testGroups, <p>Content</p>);

    expect(await page.findText("Accounts")).toBeInTheDocument();
    expect(page.getText("Checking")).toBeInTheDocument();
    expect(page.getText("Savings")).toBeInTheDocument();
  });

  it("links accounts to /accounts/:id", async () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
    ];
    mockApiResponses({ accounts });

    const page = AppLayoutPage.render(testGroups, <p>Content</p>);

    const link = await page.findLink(/Checking/);
    expect(link).toHaveAttribute("href", "/accounts/1");
  });

  it("renders Accounts nav group even when no accounts exist", () => {
    const page = AppLayoutPage.render(testGroups, <p>Content</p>);

    expect(page.getText("Accounts")).toBeInTheDocument();
  });

  it("renders add account button in Accounts group", () => {
    const page = AppLayoutPage.render(testGroups, <p>Content</p>);

    expect(page.getButton(/New Account/i)).toBeInTheDocument();
  });

  it("renders AccountIcon for each account nav item", async () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
      { id: "2", name: "Credit Card", type: AccountType.Liability },
    ];
    mockApiResponses({ accounts });

    AppLayoutPage.render(testGroups, <p>Content</p>);

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
    const transactions: Transaction[] = [
      {
        id: "t1",
        accountId: "1",
        description: "Initial",
        amount: 1500,
        date: "2024-01-01",
      },
      {
        id: "t2",
        accountId: "2",
        description: "Initial",
        amount: 250000,
        date: "2024-01-01",
      },
    ];
    mockApiResponses({ accounts, transactions });

    AppLayoutPage.render(testGroups, <p>Content</p>);

    expect(await screen.findByText("$1.5K")).toBeInTheDocument();
    expect(screen.getByText("$250K")).toBeInTheDocument();
  });

  it("shows total net worth next to Accounts label", async () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
      { id: "2", name: "Credit Card", type: AccountType.Liability },
    ];
    const transactions: Transaction[] = [
      {
        id: "t1",
        accountId: "1",
        description: "Initial",
        amount: 5000,
        date: "2024-01-01",
      },
      {
        id: "t2",
        accountId: "2",
        description: "Initial",
        amount: 1000,
        date: "2024-01-01",
      },
    ];
    mockApiResponses({ accounts, transactions });

    AppLayoutPage.render(testGroups, <p>Content</p>);

    expect(await screen.findByText("$4K")).toBeInTheDocument();
  });

  it("renders New Account as a muted link at the bottom of account list", () => {
    const page = AppLayoutPage.render(testGroups, <p>Content</p>);

    const newAccountLink = page.getButton(/New Account/i);
    expect(newAccountLink).toBeInTheDocument();
    expect(newAccountLink).toHaveClass("text-muted-foreground");
  });
});

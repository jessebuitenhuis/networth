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
    label: "Planning",
    items: [{ title: "Projections", url: "/planning" }],
  },
  {
    label: "Tracking",
    items: [{ title: "Transactions", url: "/transactions" }],
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

    expect(page.getLink("Projections")).toBeInTheDocument();
  });

  it("passes net worth to sidebar", async () => {
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

    const page = AppLayoutPage.render(testGroups, <p>Content</p>);

    expect(await page.findText("$4K")).toBeInTheDocument();
  });
});

import { describe, expect, it } from "vitest";

import { AccountType } from "@/accounts/AccountType";

import { AccountBalanceListPage } from "./AccountBalanceList.page";

const assets = [
  { id: "1", name: "Checking", type: AccountType.Asset, balance: 5000 },
  { id: "2", name: "Savings", type: AccountType.Asset, balance: 3000 },
];

describe("AccountBalanceList", () => {
  it("renders null when accounts is empty", () => {
    const page = AccountBalanceListPage.render({ title: "Assets", accounts: [], subtotal: 0 });
    expect(page.queryTitle("Assets")).not.toBeInTheDocument();
  });

  it("renders the section title", () => {
    const page = AccountBalanceListPage.render({ title: "Assets", accounts: assets, subtotal: 8000 });
    expect(page.getByText("Assets")).toBeInTheDocument();
  });

  it("renders the subtotal", () => {
    const page = AccountBalanceListPage.render({ title: "Assets", accounts: assets, subtotal: 8000 });
    expect(page.getByText("$8,000.00")).toBeInTheDocument();
  });

  it("renders each account name", () => {
    const page = AccountBalanceListPage.render({ title: "Assets", accounts: assets, subtotal: 8000 });
    expect(page.getByText("Checking")).toBeInTheDocument();
    expect(page.getByText("Savings")).toBeInTheDocument();
  });

  it("renders each account balance", () => {
    const page = AccountBalanceListPage.render({ title: "Assets", accounts: assets, subtotal: 8000 });
    expect(page.getByText("$5,000.00")).toBeInTheDocument();
    expect(page.getByText("$3,000.00")).toBeInTheDocument();
  });
});

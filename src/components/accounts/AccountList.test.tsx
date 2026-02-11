import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { AccountList } from "./AccountList";
import { AccountType } from "@/models/AccountType";
import type { Account } from "@/models/Account";
import { AccountProvider } from "@/context/AccountContext";

const accounts: Account[] = [
  { id: "1", name: "Checking", type: AccountType.Asset, balance: 1000 },
  { id: "2", name: "Credit Card", type: AccountType.Liability, balance: 500 },
];

function renderWithProvider(initialAccounts: Account[] = []) {
  localStorage.setItem("accounts", JSON.stringify(initialAccounts));
  return render(
    <AccountProvider>
      <AccountList />
    </AccountProvider>
  );
}

describe("AccountList", () => {
  beforeEach(() => localStorage.clear());

  it("shows empty message when no accounts exist", () => {
    renderWithProvider();
    expect(screen.getByText("No accounts yet.")).toBeInTheDocument();
  });

  it("lists all accounts", async () => {
    renderWithProvider(accounts);

    expect(await screen.findByText("Checking")).toBeInTheDocument();
    expect(screen.getByText("Credit Card")).toBeInTheDocument();
  });

  it("displays account type", async () => {
    renderWithProvider(accounts);

    expect(await screen.findByText("Asset")).toBeInTheDocument();
    expect(screen.getByText("Liability")).toBeInTheDocument();
  });

  it("displays formatted balance", async () => {
    renderWithProvider(accounts);

    expect(await screen.findByText("$1,000.00")).toBeInTheDocument();
    expect(screen.getByText("$500.00")).toBeInTheDocument();
  });

  it("removes account when remove button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProvider(accounts);

    const removeButtons = await screen.findAllByRole("button", { name: "Remove" });
    await user.click(removeButtons[0]);

    expect(screen.queryByText("Checking")).not.toBeInTheDocument();
    expect(screen.getByText("Credit Card")).toBeInTheDocument();
  });
});

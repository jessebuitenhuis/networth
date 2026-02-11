import { render, screen, act } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { AccountProvider, useAccounts } from "./AccountContext";
import { AccountType } from "@/models/AccountType";
import type { Account } from "@/models/Account";
import { accountReducer } from "./AccountContext";

const asset: Account = {
  id: "1",
  name: "Checking",
  type: AccountType.Asset,
  balance: 1000,
};

const liability: Account = {
  id: "2",
  name: "Credit Card",
  type: AccountType.Liability,
  balance: 500,
};

describe("accountReducer", () => {
  it("adds an account", () => {
    const result = accountReducer([], { type: "add", account: asset });
    expect(result).toEqual([asset]);
  });

  it("removes an account by id", () => {
    const result = accountReducer([asset, liability], {
      type: "remove",
      id: "1",
    });
    expect(result).toEqual([liability]);
  });

  it("sets accounts list", () => {
    const accounts = [asset, liability];
    const result = accountReducer([], { type: "set", accounts });
    expect(result).toEqual(accounts);
  });
});

function TestConsumer() {
  const { accounts, addAccount, removeAccount } = useAccounts();
  return (
    <div>
      <span data-testid="count">{accounts.length}</span>
      <button onClick={() => addAccount(asset)}>Add</button>
      <button onClick={() => removeAccount("1")}>Remove</button>
      {accounts.map((a) => (
        <span key={a.id}>{a.name}</span>
      ))}
    </div>
  );
}

describe("AccountProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with empty accounts", () => {
    render(
      <AccountProvider>
        <TestConsumer />
      </AccountProvider>
    );
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("loads accounts from localStorage on mount", async () => {
    localStorage.setItem("accounts", JSON.stringify([asset]));

    render(
      <AccountProvider>
        <TestConsumer />
      </AccountProvider>
    );

    expect(await screen.findByText("Checking")).toBeInTheDocument();
  });

  it("adds an account", () => {
    render(
      <AccountProvider>
        <TestConsumer />
      </AccountProvider>
    );

    act(() => screen.getByText("Add").click());

    expect(screen.getByText("Checking")).toBeInTheDocument();
    expect(screen.getByTestId("count")).toHaveTextContent("1");
  });

  it("removes an account", () => {
    localStorage.setItem("accounts", JSON.stringify([asset]));

    render(
      <AccountProvider>
        <TestConsumer />
      </AccountProvider>
    );

    act(() => screen.getByText("Remove").click());

    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("persists accounts to localStorage on change", () => {
    render(
      <AccountProvider>
        <TestConsumer />
      </AccountProvider>
    );

    act(() => screen.getByText("Add").click());

    const stored = JSON.parse(localStorage.getItem("accounts")!);
    expect(stored).toEqual([asset]);
  });

  it("throws when useAccounts is called outside provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      "useAccounts must be used within AccountProvider"
    );
    spy.mockRestore();
  });
});

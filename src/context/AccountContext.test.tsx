import { render, screen, act } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { AccountProvider, useAccounts } from "./AccountContext";
import { AccountType } from "@/models/AccountType";
import type { Account } from "@/models/Account.type";
import { accountReducer } from "./AccountContext";

const asset: Account = {
  id: "1",
  name: "Checking",
  type: AccountType.Asset,
};

const liability: Account = {
  id: "2",
  name: "Credit Card",
  type: AccountType.Liability,
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

  it("updates an account by id", () => {
    const result = accountReducer([asset, liability], {
      type: "update",
      account: updatedAsset,
    });
    expect(result).toEqual([updatedAsset, liability]);
  });
});

const updatedAsset: Account = {
  id: "1",
  name: "Savings",
  type: AccountType.Liability,
};

function TestConsumer() {
  const { accounts, addAccount, removeAccount, updateAccount } = useAccounts();
  return (
    <div>
      <span data-testid="count">{accounts.length}</span>
      <button onClick={() => addAccount(asset)}>Add</button>
      <button onClick={() => removeAccount("1")}>Remove</button>
      <button onClick={() => updateAccount(updatedAsset)}>Update</button>
      {accounts.map((a) => (
        <span key={a.id}>{a.name} - {a.type}</span>
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

    expect(await screen.findByText("Checking - Asset")).toBeInTheDocument();
  });

  it("adds an account", () => {
    render(
      <AccountProvider>
        <TestConsumer />
      </AccountProvider>
    );

    act(() => screen.getByText("Add").click());

    expect(screen.getByText("Checking - Asset")).toBeInTheDocument();
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

  it("updates an account", () => {
    localStorage.setItem("accounts", JSON.stringify([asset, liability]));

    render(
      <AccountProvider>
        <TestConsumer />
      </AccountProvider>
    );

    act(() => screen.getByText("Update").click());

    expect(screen.getByText("Savings - Liability")).toBeInTheDocument();
    expect(screen.getByText("Credit Card - Liability")).toBeInTheDocument();
    expect(screen.queryByText("Checking - Asset")).not.toBeInTheDocument();
  });

  it("throws when useAccounts is called outside provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      "useAccounts must be used within AccountProvider"
    );
    spy.mockRestore();
  });
});

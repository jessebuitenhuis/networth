import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Account } from "@/accounts/Account.type";
import { AccountType } from "@/accounts/AccountType";
import { AccountProvider, accountReducer,useAccounts } from "@/accounts/AccountContext";

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

const updatedAsset: Account = {
  id: "1",
  name: "Savings",
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

const mockFetch = vi.fn();

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
    vi.stubGlobal("fetch", mockFetch);
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  it("fetches accounts from API on mount", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [asset],
    });

    render(
      <AccountProvider>
        <TestConsumer />
      </AccountProvider>
    );

    expect(await screen.findByText("Checking - Asset")).toBeInTheDocument();
    expect(mockFetch).toHaveBeenCalledWith("/api/accounts");
  });

  it("starts with empty accounts before API responds", () => {
    mockFetch.mockReturnValue(new Promise(() => {}));

    render(
      <AccountProvider>
        <TestConsumer />
      </AccountProvider>
    );

    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("calls POST /api/accounts on add", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => asset });

    render(
      <AccountProvider>
        <TestConsumer />
      </AccountProvider>
    );

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith("/api/accounts")
    );

    await act(async () => screen.getByText("Add").click());

    expect(mockFetch).toHaveBeenCalledWith("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(asset),
    });
    expect(screen.getByText("Checking - Asset")).toBeInTheDocument();
  });

  it("calls DELETE /api/accounts/:id on remove", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => [asset] })
      .mockResolvedValueOnce({ ok: true });

    render(
      <AccountProvider>
        <TestConsumer />
      </AccountProvider>
    );

    await screen.findByText("Checking - Asset");

    await act(async () => screen.getByText("Remove").click());

    expect(mockFetch).toHaveBeenCalledWith("/api/accounts/1", {
      method: "DELETE",
    });
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("calls PUT /api/accounts/:id on update", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => [asset, liability] })
      .mockResolvedValueOnce({ ok: true, json: async () => updatedAsset });

    render(
      <AccountProvider>
        <TestConsumer />
      </AccountProvider>
    );

    await screen.findByText("Checking - Asset");

    await act(async () => screen.getByText("Update").click());

    expect(mockFetch).toHaveBeenCalledWith("/api/accounts/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedAsset),
    });
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

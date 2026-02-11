import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateAccountForm } from "./CreateAccountForm";
import { AccountType } from "@/models/AccountType";
import { AccountProvider, useAccounts } from "@/context/AccountContext";
import {
  TransactionProvider,
  useTransactions,
} from "@/context/TransactionContext";

function TestHarness() {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  return (
    <div>
      <CreateAccountForm />
      <ul data-testid="accounts">
        {accounts.map((a) => (
          <li key={a.id}>
            {a.name} - {a.type}
          </li>
        ))}
      </ul>
      <ul data-testid="transactions">
        {transactions.map((t) => (
          <li key={t.id}>
            {t.description} - {t.amount}
          </li>
        ))}
      </ul>
    </div>
  );
}

function renderForm() {
  return render(
    <AccountProvider>
      <TransactionProvider>
        <TestHarness />
      </TransactionProvider>
    </AccountProvider>
  );
}

describe("CreateAccountForm", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("crypto", {
      randomUUID: vi
        .fn()
        .mockReturnValueOnce("account-uuid")
        .mockReturnValueOnce("tx-uuid"),
    });
  });

  it("renders name, type, and balance fields", () => {
    renderForm();

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Type")).toBeInTheDocument();
    expect(screen.getByLabelText("Balance")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    renderForm();
    expect(
      screen.getByRole("button", { name: "Add Account" })
    ).toBeInTheDocument();
  });

  it("adds an account on submit", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Name"), "Checking");
    await user.clear(screen.getByLabelText("Balance"));
    await user.type(screen.getByLabelText("Balance"), "1500");
    await user.click(screen.getByRole("button", { name: "Add Account" }));

    expect(screen.getByText("Checking - Asset")).toBeInTheDocument();
  });

  it("creates opening balance transaction on submit", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Name"), "Checking");
    await user.clear(screen.getByLabelText("Balance"));
    await user.type(screen.getByLabelText("Balance"), "1500");
    await user.click(screen.getByRole("button", { name: "Add Account" }));

    expect(
      screen.getByText("Opening balance - 1500")
    ).toBeInTheDocument();
  });

  it("does not create transaction when balance is zero", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Name"), "Empty");
    await user.click(screen.getByRole("button", { name: "Add Account" }));

    expect(screen.getByTestId("transactions")).toBeEmptyDOMElement();
  });

  it("creates liability account", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Name"), "Credit Card");
    await user.selectOptions(
      screen.getByLabelText("Type"),
      AccountType.Liability
    );
    await user.clear(screen.getByLabelText("Balance"));
    await user.type(screen.getByLabelText("Balance"), "800");
    await user.click(screen.getByRole("button", { name: "Add Account" }));

    expect(screen.getByText("Credit Card - Liability")).toBeInTheDocument();
  });

  it("resets form after submit", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Name"), "Checking");
    await user.click(screen.getByRole("button", { name: "Add Account" }));

    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(screen.getByLabelText("Balance")).toHaveValue(0);
  });

  it("does not submit with empty name", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "Add Account" }));

    expect(screen.getByTestId("accounts")).toBeEmptyDOMElement();
  });
});

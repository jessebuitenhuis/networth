import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateAccountDialog } from "./CreateAccountDialog";
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
      <CreateAccountDialog />
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

function renderDialog() {
  return render(
    <AccountProvider>
      <TransactionProvider>
        <TestHarness />
      </TransactionProvider>
    </AccountProvider>
  );
}

async function openDialog() {
  const user = userEvent.setup();
  renderDialog();
  await user.click(screen.getByRole("button", { name: "Add Account" }));
  return user;
}

describe("CreateAccountDialog", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("crypto", {
      randomUUID: vi
        .fn()
        .mockReturnValueOnce("account-uuid")
        .mockReturnValueOnce("tx-uuid"),
    });
  });

  it("renders a trigger button", () => {
    renderDialog();

    expect(
      screen.getByRole("button", { name: "Add Account" })
    ).toBeInTheDocument();
  });

  it("opens dialog when trigger is clicked", async () => {
    await openDialog();

    expect(
      screen.getByRole("dialog", { name: "Add Account" })
    ).toBeInTheDocument();
  });

  it("dialog contains Name, Type, and Balance fields", async () => {
    await openDialog();

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Type" })).toBeInTheDocument();
    expect(screen.getByLabelText("Balance")).toBeInTheDocument();
  });

  it("submits and creates account with correct data", async () => {
    const user = await openDialog();

    await user.type(screen.getByLabelText("Name"), "Checking");
    await user.clear(screen.getByLabelText("Balance"));
    await user.type(screen.getByLabelText("Balance"), "1500");
    await user.click(screen.getByRole("button", { name: "Add Account" }));

    expect(screen.getByText("Checking - Asset")).toBeInTheDocument();
  });

  it("creates opening balance transaction when balance is non-zero", async () => {
    const user = await openDialog();

    await user.type(screen.getByLabelText("Name"), "Checking");
    await user.clear(screen.getByLabelText("Balance"));
    await user.type(screen.getByLabelText("Balance"), "1500");
    await user.click(screen.getByRole("button", { name: "Add Account" }));

    expect(screen.getByText("Opening balance - 1500")).toBeInTheDocument();
  });

  it("does not create transaction when balance is zero", async () => {
    const user = await openDialog();

    await user.type(screen.getByLabelText("Name"), "Empty");
    await user.click(screen.getByRole("button", { name: "Add Account" }));

    expect(screen.getByTestId("transactions")).toBeEmptyDOMElement();
  });

  it("closes dialog after successful submit", async () => {
    const user = await openDialog();

    await user.type(screen.getByLabelText("Name"), "Checking");
    await user.click(screen.getByRole("button", { name: "Add Account" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("resets form after submit", async () => {
    const user = await openDialog();

    await user.type(screen.getByLabelText("Name"), "Checking");
    await user.clear(screen.getByLabelText("Balance"));
    await user.type(screen.getByLabelText("Balance"), "500");
    await user.click(screen.getByRole("button", { name: "Add Account" }));

    // Re-open dialog to check form is reset
    await user.click(screen.getByRole("button", { name: "Add Account" }));

    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(screen.getByLabelText("Balance")).toHaveValue(0);
  });

  it("does not submit with empty name", async () => {
    const user = await openDialog();

    await user.click(screen.getByRole("button", { name: "Add Account" }));

    expect(screen.getByTestId("accounts")).toBeEmptyDOMElement();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("creates liability account", async () => {
    const user = await openDialog();

    await user.click(screen.getByRole("combobox", { name: "Type" }));
    await user.click(screen.getByRole("option", { name: "Liability" }));

    await user.type(screen.getByLabelText("Name"), "Credit Card");
    await user.clear(screen.getByLabelText("Balance"));
    await user.type(screen.getByLabelText("Balance"), "800");
    await user.click(screen.getByRole("button", { name: "Add Account" }));

    expect(screen.getByText("Credit Card - Liability")).toBeInTheDocument();
  });
});

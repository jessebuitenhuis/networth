import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EditAccountDialog } from "./EditAccountDialog";
import { AccountProvider, useAccounts } from "@/context/AccountContext";
import {
  TransactionProvider,
  useTransactions,
} from "@/context/TransactionContext";
import { AccountType } from "@/models/AccountType";
import type { Account } from "@/models/Account";

const account: Account = {
  id: "1",
  name: "Checking",
  type: AccountType.Asset,
};

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

function TestHarness({ account }: { account: Account }) {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  return (
    <div>
      <EditAccountDialog account={account} />
      <ul data-testid="accounts">
        {accounts.map((a) => (
          <li key={a.id}>
            {a.name} - {a.type}
          </li>
        ))}
      </ul>
      <span data-testid="tx-count">{transactions.length}</span>
    </div>
  );
}

function renderDialog(a: Account = account) {
  return render(
    <AccountProvider>
      <TransactionProvider>
        <TestHarness account={a} />
      </TransactionProvider>
    </AccountProvider>
  );
}

async function openDialog(a: Account = account) {
  const user = userEvent.setup();
  renderDialog(a);
  await user.click(screen.getByRole("button", { name: "Edit Account" }));
  return user;
}

describe("EditAccountDialog", () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
  });

  it("renders pencil trigger with correct aria-label", () => {
    renderDialog();
    expect(
      screen.getByRole("button", { name: "Edit Account" })
    ).toBeInTheDocument();
  });

  it("opens dialog showing current name and type", async () => {
    await openDialog();

    expect(
      screen.getByRole("dialog", { name: "Edit Account" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("Checking");
    expect(screen.getByRole("combobox", { name: "Type" })).toHaveTextContent(
      "Asset"
    );
  });

  it("editing name and saving calls updateAccount", async () => {
    localStorage.setItem("accounts", JSON.stringify([account]));
    const user = await openDialog();

    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "Savings");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Savings - Asset")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("editing type and saving calls updateAccount", async () => {
    localStorage.setItem("accounts", JSON.stringify([account]));
    const user = await openDialog();

    await user.click(screen.getByRole("combobox", { name: "Type" }));
    await user.click(screen.getByRole("option", { name: "Liability" }));
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Checking - Liability")).toBeInTheDocument();
  });

  it("empty name prevents submit", async () => {
    localStorage.setItem("accounts", JSON.stringify([account]));
    const user = await openDialog();

    await user.clear(screen.getByLabelText("Name"));
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Checking - Asset")).toBeInTheDocument();
  });

  it("delete button shows confirmation dialog", async () => {
    const user = await openDialog();

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(
      screen.queryByRole("dialog", { name: "Edit Account" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/are you sure you want to delete this account/i)
    ).toBeInTheDocument();
  });

  it("confirming delete calls removeTransactionsByAccountId and removeAccount", async () => {
    localStorage.setItem("accounts", JSON.stringify([account]));
    localStorage.setItem(
      "transactions",
      JSON.stringify([
        {
          id: "t1",
          accountId: "1",
          amount: 100,
          date: "2024-01-01",
          description: "Test",
        },
      ])
    );
    const user = await openDialog();

    await user.click(screen.getByRole("button", { name: "Delete" }));
    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    await user.click(deleteButtons[deleteButtons.length - 1]);

    expect(screen.getByTestId("accounts")).toBeEmptyDOMElement();
    expect(screen.getByTestId("tx-count")).toHaveTextContent("0");
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("resets form when dialog is reopened", async () => {
    localStorage.setItem("accounts", JSON.stringify([account]));
    const user = await openDialog();

    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "Changed");
    await user.keyboard("{Escape}");

    await user.click(screen.getByRole("button", { name: "Edit Account" }));
    expect(screen.getByLabelText("Name")).toHaveValue("Checking");
  });

  it("canceling delete returns to edit dialog", async () => {
    const user = await openDialog();

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      screen.queryByText(/are you sure you want to delete this account/i)
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("dialog", { name: "Edit Account" })
    ).toBeInTheDocument();
  });

  it("delete confirmation button uses destructive variant", async () => {
    const user = await openDialog();

    await user.click(screen.getByRole("button", { name: "Delete" }));

    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    const confirmButton = deleteButtons[deleteButtons.length - 1];
    expect(confirmButton).toHaveClass("bg-destructive");
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateTransactionForm } from "./CreateTransactionForm";
import { AccountProvider } from "@/context/AccountContext";
import {
  TransactionProvider,
  useTransactions,
} from "@/context/TransactionContext";

function TestHarness({ accountId }: { accountId: string }) {
  const { transactions } = useTransactions();
  const filtered = transactions.filter((t) => t.accountId === accountId);
  return (
    <div>
      <CreateTransactionForm accountId={accountId} />
      <ul data-testid="transactions">
        {filtered.map((t) => (
          <li key={t.id}>
            {t.description} - {t.amount}
          </li>
        ))}
      </ul>
    </div>
  );
}

function renderForm(accountId = "a1") {
  return render(
    <AccountProvider>
      <TransactionProvider>
        <TestHarness accountId={accountId} />
      </TransactionProvider>
    </AccountProvider>
  );
}

describe("CreateTransactionForm", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("crypto", {
      randomUUID: () => "tx-uuid",
    });
  });

  it("renders amount, date, and description fields", () => {
    renderForm();

    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
    expect(screen.getByLabelText("Date")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
  });

  it("defaults date to today", () => {
    renderForm();

    const today = new Date().toISOString().split("T")[0];
    expect(screen.getByLabelText("Date")).toHaveValue(today);
  });

  it("adds transaction on submit with correct accountId", async () => {
    const user = userEvent.setup();
    renderForm("a1");

    await user.clear(screen.getByLabelText("Amount"));
    await user.type(screen.getByLabelText("Amount"), "250");
    await user.type(screen.getByLabelText("Description"), "Groceries");
    await user.click(screen.getByRole("button", { name: "Add Transaction" }));

    expect(screen.getByText("Groceries - 250")).toBeInTheDocument();
  });

  it("resets form after submit", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.clear(screen.getByLabelText("Amount"));
    await user.type(screen.getByLabelText("Amount"), "250");
    await user.type(screen.getByLabelText("Description"), "Groceries");
    await user.click(screen.getByRole("button", { name: "Add Transaction" }));

    expect(screen.getByLabelText("Amount")).toHaveValue(0);
    expect(screen.getByLabelText("Description")).toHaveValue("");
  });

  it("does not submit with zero amount", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Description"), "Nothing");
    await user.click(screen.getByRole("button", { name: "Add Transaction" }));

    expect(screen.getByTestId("transactions")).toBeEmptyDOMElement();
  });
});

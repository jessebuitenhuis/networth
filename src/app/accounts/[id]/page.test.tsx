import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Account } from "@/accounts/Account.type";
import { AccountProvider } from "@/accounts/AccountContext";
import { AccountType } from "@/accounts/AccountType";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RecurringTransactionProvider } from "@/recurring-transactions/RecurringTransactionContext";
import type { Scenario } from "@/scenarios/Scenario.type";
import { ScenarioProvider } from "@/scenarios/ScenarioContext";
import { mockApiResponses } from "@/test/mocks/mockApiResponses";
import { mockResizeObserver } from "@/test/mocks/mockResizeObserver";
import { suppressActWarnings } from "@/test/mocks/suppressActWarnings";
import { suppressRechartsWarnings } from "@/test/mocks/suppressRechartsWarnings";
import type { Transaction } from "@/transactions/Transaction.type";
import { TransactionProvider } from "@/transactions/TransactionContext";

import AccountDetailPage from "./page";

mockResizeObserver();
suppressRechartsWarnings();
suppressActWarnings();

const accounts: Account[] = [
  { id: "a1", name: "Checking", type: AccountType.Asset },
];

const transactions: Transaction[] = [
  { id: "t1", accountId: "a1", amount: 1000, date: "2024-01-01", description: "Opening balance" },
  { id: "t2", accountId: "a1", amount: -200, date: "2024-01-02", description: "Groceries" },
];

function renderPage(
  id: string,
  opts: {
    accounts?: Account[];
    transactions?: Transaction[];
    scenarios?: Scenario[];
    activeScenarioId?: string | null;
  } = {}
) {
  mockApiResponses({
    accounts: opts.accounts ?? [],
    transactions: opts.transactions ?? [],
    scenarios: opts.scenarios ?? [],
    activeScenarioId: opts.activeScenarioId ?? null,
  });
  return render(
    <TooltipProvider>
      <SidebarProvider>
        <AccountProvider>
          <TransactionProvider>
            <ScenarioProvider>
              <RecurringTransactionProvider>
                <AccountDetailPage params={{ id }} />
              </RecurringTransactionProvider>
            </ScenarioProvider>
          </TransactionProvider>
        </AccountProvider>
      </SidebarProvider>
    </TooltipProvider>
  );
}

describe("AccountDetailPage", () => {
  beforeEach(() => {
    mockApiResponses();
    vi.stubGlobal("crypto", { randomUUID: () => "test-uuid" });
  });

  it("shows account name as heading", async () => {
    renderPage("a1", { accounts, transactions });

    expect(await screen.findByRole("heading", { name: "Checking" })).toBeInTheDocument();
  });

  it("shows current balance computed from transactions", async () => {
    renderPage("a1", { accounts, transactions });

    expect(await screen.findByText("US$800.00")).toBeInTheDocument();
  });

  it("renders transaction list", async () => {
    renderPage("a1", { accounts, transactions });

    expect(await screen.findByText("Opening balance")).toBeInTheDocument();
    expect(screen.getByText("Groceries")).toBeInTheDocument();
  });

  it("renders add transaction dialog trigger", async () => {
    renderPage("a1", { accounts });

    expect(await screen.findByRole("button", { name: "Add Transaction" })).toBeInTheDocument();
  });

  it("shows 'Account not found' for invalid ID", () => {
    renderPage("nonexistent");

    expect(screen.getByText("Account not found")).toBeInTheDocument();
  });

  it("shows scenario filter in TopBar with 'Baseline only' default", async () => {
    const scenarios: Scenario[] = [
      { id: "s1", name: "Scenario 1", description: "" },
    ];
    renderPage("a1", { accounts, transactions, scenarios });

    const filter = await screen.findByRole("combobox", { name: "Scenario filter" });
    expect(filter).toHaveTextContent("Baseline only");
  });

  it("filters balance by selected scenario", async () => {
    const user = userEvent.setup();
    const scenarios: Scenario[] = [
      { id: "s1", name: "Scenario 1", description: "" },
    ];
    const scenarioTransactions: Transaction[] = [
      { id: "t1", accountId: "a1", amount: 1000, date: "2024-01-01", description: "Baseline" },
      { id: "t2", accountId: "a1", amount: 500, date: "2024-01-02", description: "Scenario tx", scenarioId: "s1" },
    ];
    renderPage("a1", { accounts, transactions: scenarioTransactions, scenarios });

    expect(await screen.findByText("US$1,000.00")).toBeInTheDocument();

    const filter = screen.getByRole("combobox", { name: "Scenario filter" });
    await user.click(filter);

    const scenario1Option = screen.getByRole("option", { name: "Scenario 1" });
    await user.click(scenario1Option);

    expect(await screen.findByText("US$1,500.00")).toBeInTheDocument();
  });

  it("handles deleted scenario gracefully (falls back to baseline)", async () => {
    const scenarios: Scenario[] = [
      { id: "s1", name: "Scenario 1", description: "" },
    ];
    const scenarioTransactions: Transaction[] = [
      { id: "t1", accountId: "a1", amount: 1000, date: "2024-01-01", description: "Baseline" },
      { id: "t2", accountId: "a1", amount: 500, date: "2024-01-02", description: "Deleted scenario tx", scenarioId: "deleted" },
    ];
    renderPage("a1", { accounts, transactions: scenarioTransactions, scenarios, activeScenarioId: "deleted" });

    const filter = await screen.findByRole("combobox", { name: "Scenario filter" });
    expect(filter).toHaveTextContent("Baseline only");

    expect(await screen.findByText("US$1,000.00")).toBeInTheDocument();
  });
});

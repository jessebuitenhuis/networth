import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PlanningPage from "./page";
import { AccountProvider } from "@/context/AccountContext";
import { TransactionProvider } from "@/context/TransactionContext";
import { RecurringTransactionProvider } from "@/context/RecurringTransactionContext";

vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);

describe("PlanningPage", () => {
  beforeEach(() => localStorage.clear());

  it("renders the Planning heading", () => {
    render(
      <AccountProvider>
        <TransactionProvider>
          <RecurringTransactionProvider>
            <PlanningPage />
          </RecurringTransactionProvider>
        </TransactionProvider>
      </AccountProvider>
    );

    expect(
      screen.getByRole("heading", { name: "Planning" })
    ).toBeInTheDocument();
  });

  it("renders the projected net worth chart", () => {
    render(
      <AccountProvider>
        <TransactionProvider>
          <RecurringTransactionProvider>
            <PlanningPage />
          </RecurringTransactionProvider>
        </TransactionProvider>
      </AccountProvider>
    );

    expect(screen.getByTestId("projected-chart")).toBeInTheDocument();
  });
});

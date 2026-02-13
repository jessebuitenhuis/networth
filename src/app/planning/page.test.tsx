import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AccountProvider } from "@/context/AccountContext";
import { RecurringTransactionProvider } from "@/context/RecurringTransactionContext";
import { ScenarioProvider } from "@/context/ScenarioContext";
import { TransactionProvider } from "@/context/TransactionContext";
import { mockResizeObserver } from "@/test/mocks/mockResizeObserver";
import { suppressRechartsWarnings } from "@/test/mocks/suppressRechartsWarnings";

import PlanningPage from "./page";

mockResizeObserver();
suppressRechartsWarnings();

function renderPage() {
  return render(
    <SidebarProvider>
      <AccountProvider>
        <TransactionProvider>
          <ScenarioProvider>
            <RecurringTransactionProvider>
              <PlanningPage />
            </RecurringTransactionProvider>
          </ScenarioProvider>
        </TransactionProvider>
      </AccountProvider>
    </SidebarProvider>
  );
}

describe("PlanningPage", () => {
  beforeEach(() => localStorage.clear());

  it("renders the Planning heading", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Planning" })
    ).toBeInTheDocument();
  });

  it("renders the projected net worth chart", () => {
    renderPage();

    expect(screen.getByTestId("projected-chart")).toBeInTheDocument();
  });

  it("renders the duplicate scenario button", () => {
    renderPage();

    expect(
      screen.getByRole("button", { name: /duplicate/i })
    ).toBeInTheDocument();
  });

  it("shows edit button when scenario is selected", () => {
    localStorage.setItem("scenarios", JSON.stringify([{ id: "1", name: "Test" }]));
    localStorage.setItem("activeScenarioId", "1");

    renderPage();

    expect(screen.getByRole("button", { name: "Edit Scenario" })).toBeInTheDocument();
  });

  it("hides edit button when baseline is selected", () => {
    localStorage.setItem("scenarios", JSON.stringify([{ id: "1", name: "Test" }]));
    localStorage.setItem("activeScenarioId", "");

    renderPage();

    expect(screen.queryByRole("button", { name: "Edit Scenario" })).not.toBeInTheDocument();
  });
});

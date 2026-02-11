import { render, screen } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { AccountProvider } from "@/context/AccountContext";
import { TransactionProvider } from "@/context/TransactionContext";
import Home from "./page";

vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);

function renderPage() {
  return render(
    <AccountProvider>
      <TransactionProvider>
        <Home />
      </TransactionProvider>
    </AccountProvider>
  );
}

describe("Dashboard", () => {
  beforeEach(() => localStorage.clear());

  it("renders the page heading", () => {
    renderPage();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Dashboard"
    );
  });

  it("renders net worth summary", () => {
    renderPage();
    expect(screen.getByText("Net Worth")).toBeInTheDocument();
  });

  it("renders account list", () => {
    renderPage();
    expect(screen.getByText("No accounts yet.")).toBeInTheDocument();
  });

  it("renders the net worth chart", () => {
    renderPage();
    expect(screen.getByTestId("net-worth-chart")).toBeInTheDocument();
  });
});

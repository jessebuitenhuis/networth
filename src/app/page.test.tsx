import { render, screen } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import { AccountProvider } from "@/context/AccountContext";
import Home from "./page";

function renderPage() {
  return render(
    <AccountProvider>
      <Home />
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

  it("renders create account form", () => {
    renderPage();
    expect(
      screen.getByRole("button", { name: "Add Account" })
    ).toBeInTheDocument();
  });

  it("renders account list", () => {
    renderPage();
    expect(screen.getByText("No accounts yet.")).toBeInTheDocument();
  });
});

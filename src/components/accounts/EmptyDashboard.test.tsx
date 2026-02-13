import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyDashboard } from "./EmptyDashboard";

describe("EmptyDashboard", () => {
  it("renders welcome heading", () => {
    render(<EmptyDashboard createAccountTrigger={<button>Test</button>} />);
    expect(screen.getByText("Welcome to Net Worth Tracker")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(<EmptyDashboard createAccountTrigger={<button>Test</button>} />);
    expect(
      screen.getByText(/create your first account to start tracking/i)
    ).toBeInTheDocument();
  });

  it("renders create account trigger", () => {
    render(<EmptyDashboard createAccountTrigger={<button>Create Account</button>} />);
    expect(screen.getByRole("button", { name: "Create Account" })).toBeInTheDocument();
  });
});

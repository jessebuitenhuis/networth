import { describe, expect, it } from "vitest";

import { EmptyDashboardPage } from "./EmptyDashboard.page";

describe("EmptyDashboard", () => {
  it("renders welcome heading", () => {
    const page = EmptyDashboardPage.render();
    expect(page.heading).toBeInTheDocument();
  });

  it("renders description", () => {
    const page = EmptyDashboardPage.render();
    expect(page.description).toBeInTheDocument();
  });

  it("renders create account trigger", () => {
    const page = EmptyDashboardPage.render(<button>Create Account</button>);
    expect(page.getButton("Create Account")).toBeInTheDocument();
  });
});

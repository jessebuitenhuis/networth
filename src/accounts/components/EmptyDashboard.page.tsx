import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BasePageObject } from "@/test/page/BasePageObject";

import { EmptyDashboard } from "./EmptyDashboard";

export class EmptyDashboardPage extends BasePageObject {
  private constructor(user: ReturnType<typeof userEvent.setup>) {
    super(user);
  }

  static render(createAccountTrigger: React.ReactNode = <button>Test</button>) {
    const user = userEvent.setup();
    render(<EmptyDashboard createAccountTrigger={createAccountTrigger} />);
    return new EmptyDashboardPage(user);
  }

  get heading() {
    return screen.getByText("Welcome to Net Worth Tracker");
  }

  get description() {
    return screen.getByText(/create your first account to start tracking/i);
  }

  getButton(name: string) {
    return screen.getByRole("button", { name });
  }
}

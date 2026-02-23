import { render, screen } from "@testing-library/react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { GoalProvider } from "@/goals/GoalContext";

import GoalsPage from "./page";

export class GoalsPageObject {
  private constructor() {}

  static render() {
    render(
      <SidebarProvider>
        <GoalProvider>
          <GoalsPage />
        </GoalProvider>
      </SidebarProvider>
    );
    return new GoalsPageObject();
  }

  getHeading(name: string) {
    return screen.getByRole("heading", { name });
  }

  getButton(name: string | RegExp) {
    return screen.getByRole("button", { name });
  }

  getText(text: string | RegExp) {
    return screen.getByText(text);
  }
}

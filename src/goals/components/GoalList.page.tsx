import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Goal } from "@/goals/Goal.type";
import { GoalProvider } from "@/goals/GoalContext";
import { BasePageObject } from "@/test/page/BasePageObject";

import { GoalList } from "./GoalList";

export class GoalListPage extends BasePageObject {
  private constructor(user: ReturnType<typeof userEvent.setup>) {
    super(user);
  }

  static render(goals: Goal[]) {
    const user = userEvent.setup();
    render(
      <GoalProvider>
        <GoalList goals={goals} />
      </GoalProvider>,
    );
    return new GoalListPage(user);
  }

  getByText(text: string | RegExp) {
    return screen.getByText(text);
  }

  getByRole(role: Parameters<typeof screen.getByRole>[0], options?: { name: string | RegExp }) {
    return screen.getByRole(role, options);
  }

  queryByText(text: string | RegExp) {
    return screen.queryByText(text);
  }
}

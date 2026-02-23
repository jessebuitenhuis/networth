import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Goal } from "@/goals/Goal.type";
import { BasePageObject } from "@/test/page/BasePageObject";

import { GoalCard } from "./GoalCard";

type GoalCardRenderProps = {
  goal: Goal;
  editAction?: React.ReactNode;
};

export class GoalCardPage extends BasePageObject {
  private constructor(user: ReturnType<typeof userEvent.setup>) {
    super(user);
  }

  static render({ goal, editAction = <button>Edit</button> }: GoalCardRenderProps) {
    const user = userEvent.setup();
    render(<GoalCard goal={goal} editAction={editAction} />);
    return new GoalCardPage(user);
  }

  getByText(text: string | RegExp) {
    return screen.getByText(text);
  }

  getByRole(role: Parameters<typeof screen.getByRole>[0], options?: { name: string | RegExp }) {
    return screen.getByRole(role, options);
  }
}

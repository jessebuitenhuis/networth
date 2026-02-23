import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { GoalProgress } from "@/goals/GoalProgress.type";
import { BasePageObject } from "@/test/page/BasePageObject";

import { GoalProgressCard } from "./GoalProgressCard";

type GoalProgressCardRenderProps = {
  progress: GoalProgress;
  colorIndex: number;
};

export class GoalProgressCardPage extends BasePageObject {
  private constructor(user: ReturnType<typeof userEvent.setup>) {
    super(user);
  }

  static render({ progress, colorIndex }: GoalProgressCardRenderProps) {
    const user = userEvent.setup();
    render(<GoalProgressCard progress={progress} colorIndex={colorIndex} />);
    return new GoalProgressCardPage(user);
  }

  static rerender(
    renderResult: ReturnType<typeof render>,
    { progress, colorIndex }: GoalProgressCardRenderProps,
  ) {
    renderResult.rerender(<GoalProgressCard progress={progress} colorIndex={colorIndex} />);
  }

  getByText(text: string | RegExp) {
    return screen.getByText(text);
  }

  get progressBar() {
    return screen.getByRole("progressbar");
  }
}

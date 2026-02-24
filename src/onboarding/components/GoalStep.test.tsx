import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { GoalStep } from "./GoalStep";

describe("GoalStep", () => {
  it("renders name and target amount inputs", () => {
    render(<GoalStep goal={null} onSetGoal={vi.fn()} />);
    expect(screen.getByLabelText("Goal name")).toBeInTheDocument();
    expect(screen.getByLabelText("Target amount")).toBeInTheDocument();
  });

  it("calls onSetGoal when name is entered", async () => {
    const user = userEvent.setup();
    const onSetGoal = vi.fn();
    render(<GoalStep goal={null} onSetGoal={onSetGoal} />);

    await user.type(screen.getByLabelText("Goal name"), "Retirement");

    expect(onSetGoal).toHaveBeenCalledWith(
      expect.objectContaining({ name: expect.stringContaining("R") }),
    );
  });

  it("displays existing goal values", () => {
    const goal = { name: "Retirement", targetAmount: 1000000 };
    render(<GoalStep goal={goal} onSetGoal={vi.fn()} />);
    expect(screen.getByLabelText("Goal name")).toHaveValue("Retirement");
  });
});

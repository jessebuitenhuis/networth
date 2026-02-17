import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Goal } from "./Goal.type";
import { GoalCard } from "./GoalCard";

const goal: Goal = {
  id: "1",
  name: "Emergency Fund",
  targetAmount: 10000,
};

describe("GoalCard", () => {
  it("displays goal name", () => {
    render(<GoalCard goal={goal} editAction={<button>Edit</button>} />);
    expect(screen.getByText("Emergency Fund")).toBeInTheDocument();
  });

  it("displays formatted target amount", () => {
    render(<GoalCard goal={goal} editAction={<button>Edit</button>} />);
    expect(screen.getByText("$10,000.00")).toBeInTheDocument();
  });

  it("renders edit action", () => {
    render(<GoalCard goal={goal} editAction={<button>Edit</button>} />);
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });
});

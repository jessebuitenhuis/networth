import { beforeEach, describe, expect, it } from "vitest";

import { GoalsPageObject } from "./page.page";

describe("GoalsPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders TopBar with title", () => {
    const page = GoalsPageObject.render();
    expect(page.getHeading("Goals")).toBeInTheDocument();
  });

  it("renders CreateGoalDialog in TopBar actions", () => {
    const page = GoalsPageObject.render();
    expect(page.getButton(/add goal/i)).toBeInTheDocument();
  });

  it("renders GoalList", () => {
    const page = GoalsPageObject.render();
    expect(
      page.getText(
        /no goals yet\. add a goal to start tracking your financial targets\./i
      )
    ).toBeInTheDocument();
  });
});

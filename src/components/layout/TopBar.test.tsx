import { describe, expect, it } from "vitest";

import { TopBarPage } from "./TopBar.page";

describe("TopBar", () => {
  it("renders SidebarTrigger", () => {
    const page = TopBarPage.render();

    expect(page.sidebarTrigger).toBeInTheDocument();
  });

  it("renders title as h1 when provided", () => {
    const page = TopBarPage.render({ title: "Test Page" });

    expect(page.getHeading("Test Page", 1)).toBeInTheDocument();
  });

  it("renders actions when provided", () => {
    const page = TopBarPage.render({
      actions: <button type="button">Test Action</button>,
    });

    expect(page.getButton("Test Action")).toBeInTheDocument();
  });

  it("does not render h1 when no title provided", () => {
    const page = TopBarPage.render();

    expect(page.queryHeading(1)).toHaveLength(0);
  });

  it("does not render actions container when no actions provided", () => {
    const page = TopBarPage.render();

    expect(page.header).toBeInTheDocument();
    expect(page.queryAllButtons()).toHaveLength(1); // only sidebar trigger
  });
});

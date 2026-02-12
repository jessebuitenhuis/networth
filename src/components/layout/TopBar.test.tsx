import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SidebarProvider } from "@/components/ui/sidebar";
import TopBar from "./TopBar";

describe("TopBar", () => {
  it("renders SidebarTrigger", () => {
    const { container } = render(
      <SidebarProvider>
        <TopBar />
      </SidebarProvider>
    );

    const trigger = container.querySelector('[data-slot="sidebar-trigger"]');
    expect(trigger).toBeInTheDocument();
  });

  it("renders title as h1 when provided", () => {
    render(
      <SidebarProvider>
        <TopBar title="Test Page" />
      </SidebarProvider>
    );

    const heading = screen.getByRole("heading", { level: 1, name: "Test Page" });
    expect(heading).toBeInTheDocument();
  });

  it("renders actions when provided", () => {
    render(
      <SidebarProvider>
        <TopBar
          actions={
            <button type="button">Test Action</button>
          }
        />
      </SidebarProvider>
    );

    const action = screen.getByRole("button", { name: "Test Action" });
    expect(action).toBeInTheDocument();
  });

  it("does not render h1 when no title provided", () => {
    render(
      <SidebarProvider>
        <TopBar />
      </SidebarProvider>
    );

    const headings = screen.queryAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(0);
  });

  it("does not render actions container when no actions provided", () => {
    const { container } = render(
      <SidebarProvider>
        <TopBar />
      </SidebarProvider>
    );

    const header = container.querySelector("header");
    expect(header).toBeInTheDocument();

    const buttons = screen.queryAllByRole("button");
    expect(buttons).toHaveLength(1); // only sidebar trigger
  });
});

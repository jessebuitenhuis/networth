import { render, screen } from "@testing-library/react";
import { ReactNode } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";

import TopBar from "./TopBar";

export class TopBarPage {
  private constructor(private _container: HTMLElement) {}

  static render(props: { title?: string; actions?: ReactNode } = {}) {
    const { container } = render(
      <SidebarProvider>
        <TopBar {...props} />
      </SidebarProvider>
    );
    return new TopBarPage(container);
  }

  get sidebarTrigger() {
    return this._container.querySelector('[data-slot="sidebar-trigger"]');
  }

  get header() {
    return this._container.querySelector("header");
  }

  queryHeading(level: 1 | 2 | 3 = 1) {
    return screen.queryAllByRole("heading", { level });
  }

  getHeading(name: string, level: 1 | 2 | 3 = 1) {
    return screen.getByRole("heading", { level, name });
  }

  getButton(name: string) {
    return screen.getByRole("button", { name });
  }

  queryAllButtons() {
    return screen.queryAllByRole("button");
  }
}

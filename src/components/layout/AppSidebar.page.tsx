import { fireEvent, render, screen } from "@testing-library/react";

import { SidebarProvider } from "@/components/ui/sidebar";

import { AppSidebar } from "./AppSidebar";
import type { NavGroup } from "./NavGroup.type";

export class AppSidebarPage {
  private constructor(private _container: HTMLElement) {}

  static render(navGroups: NavGroup[]) {
    const { container } = render(
      <SidebarProvider>
        <AppSidebar navGroups={navGroups} />
      </SidebarProvider>
    );
    return new AppSidebarPage(container);
  }

  get sidebarHeader() {
    return this._container.querySelector("[data-slot='sidebar-header']");
  }

  getText(text: string) {
    return screen.getByText(text);
  }

  getLink(name: string) {
    return screen.getByRole("link", { name });
  }

  getButton(name: string) {
    return screen.getByRole("button", { name });
  }

  getTestId(testId: string) {
    return screen.getByTestId(testId);
  }

  queryButton(name: string) {
    return screen.queryByRole("button", { name });
  }

  queryLink() {
    return screen.queryByRole("link");
  }

  hoverItem(linkName: string) {
    const link = this.getLink(linkName);
    const listItem = link.closest('[data-slot="sidebar-menu-item"]')!;
    fireEvent.mouseEnter(listItem);
  }
}

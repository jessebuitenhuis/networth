"use client";

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import type { NavGroup } from "./NavGroup";

type AppLayoutProps = {
  navGroups: NavGroup[];
  children: React.ReactNode;
};

export function AppLayout({ navGroups, children }: AppLayoutProps) {
  return (
    <>
      <AppSidebar navGroups={navGroups} />
      <SidebarInset>
        <header className="flex h-12 items-center gap-2 border-b px-4">
          <SidebarTrigger />
        </header>
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </>
  );
}

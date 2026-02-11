"use client";

import { useMemo } from "react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useAccounts } from "@/context/AccountContext";
import { CreateAccountDialog } from "@/components/accounts/CreateAccountDialog";
import { EditAccountDialog } from "@/components/accounts/EditAccountDialog";
import { AppSidebar } from "./AppSidebar";
import type { NavGroup } from "./NavGroup";

type AppLayoutProps = {
  navGroups: NavGroup[];
  children: React.ReactNode;
};

export function AppLayout({ navGroups, children }: AppLayoutProps) {
  const { accounts } = useAccounts();

  const allGroups = useMemo(() => {
    const accountsGroup: NavGroup = {
      label: "Accounts",
      items: accounts.map((a) => ({
        title: a.name,
        url: `/accounts/${a.id}`,
        action: <EditAccountDialog account={a} />,
      })),
      action: <CreateAccountDialog />,
    };
    return [...navGroups, accountsGroup];
  }, [navGroups, accounts]);

  return (
    <>
      <AppSidebar navGroups={allGroups} />
      <SidebarInset>
        <header className="flex h-12 items-center gap-2 border-b px-4">
          <SidebarTrigger />
        </header>
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </>
  );
}

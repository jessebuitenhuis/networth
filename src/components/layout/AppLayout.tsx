"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { AccountIcon } from "@/components/accounts/AccountIcon";
import { CreateAccountDialog } from "@/components/accounts/CreateAccountDialog";
import { EditAccountDialog } from "@/components/accounts/EditAccountDialog";
import { SidebarInset } from "@/components/ui/sidebar";
import { useAccounts } from "@/context/AccountContext";

import { AppSidebar } from "./AppSidebar";
import type { NavGroup } from "./NavGroup.type";

type AppLayoutProps = {
  navGroups: NavGroup[];
  children: React.ReactNode;
};

export function AppLayout({ navGroups, children }: AppLayoutProps) {
  const { accounts } = useAccounts();
  const pathname = usePathname();

  const allGroups = useMemo(() => {
    const mainGroups = navGroups.map((group) => ({
      ...group,
      items: group.items.map((item) => ({
        ...item,
        isActive: pathname === item.url,
      })),
    }));

    const accountsGroup: NavGroup = {
      label: "Accounts",
      items: accounts.map((a) => ({
        title: a.name,
        url: `/accounts/${a.id}`,
        icon: <AccountIcon name={a.name} type={a.type} />,
        isActive: pathname === `/accounts/${a.id}`,
        action: <EditAccountDialog account={a} />,
      })),
      action: <CreateAccountDialog />,
    };
    return [...mainGroups, accountsGroup];
  }, [navGroups, accounts, pathname]);

  return (
    <>
      <AppSidebar navGroups={allGroups} />
      <SidebarInset>{children}</SidebarInset>
    </>
  );
}

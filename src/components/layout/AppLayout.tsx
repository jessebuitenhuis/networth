"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { useAccounts } from "@/accounts/AccountContext";
import { AccountType } from "@/accounts/AccountType";
import { SidebarInset } from "@/components/ui/sidebar";
import { useTransactions } from "@/transactions/TransactionContext";

import { AppSidebar } from "./AppSidebar";
import type { NavGroup } from "./NavGroup.type";

type AppLayoutProps = {
  navGroups: NavGroup[];
  children: React.ReactNode;
};

export function AppLayout({ navGroups, children }: AppLayoutProps) {
  const { accounts } = useAccounts();
  const { getBalance } = useTransactions();
  const pathname = usePathname();

  const { groups, netWorth } = useMemo(() => {
    const groups = navGroups.map((group) => ({
      ...group,
      items: group.items.map((item) => ({
        ...item,
        isActive: pathname === item.url,
      })),
    }));

    const netWorth = accounts.reduce((sum, a) => {
      const bal = getBalance(a.id);
      return a.type === AccountType.Asset ? sum + bal : sum - bal;
    }, 0);

    return { groups, netWorth };
  }, [navGroups, accounts, pathname, getBalance]);

  return (
    <>
      <AppSidebar navGroups={groups} netWorth={netWorth} />
      <SidebarInset>{children}</SidebarInset>
    </>
  );
}

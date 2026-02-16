"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { AccountType } from "@/accounts/AccountType";
import { AccountIcon } from "@/components/accounts/AccountIcon";
import { CreateAccountDialog } from "@/components/accounts/CreateAccountDialog";
import { EditAccountDialog } from "@/components/accounts/EditAccountDialog";
import { SidebarInset } from "@/components/ui/sidebar";
import { useAccounts } from "@/context/AccountContext";
import { useTransactions } from "@/context/TransactionContext";
import { formatCompactCurrency } from "@/lib/formatCompactCurrency";

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

  const allGroups = useMemo(() => {
    const mainGroups = navGroups.map((group) => ({
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

    const accountsGroup: NavGroup = {
      label: "Accounts",
      labelSuffix: formatCompactCurrency(netWorth),
      items: accounts.map((a) => ({
        title: a.name,
        url: `/accounts/${a.id}`,
        icon: <AccountIcon name={a.name} type={a.type} />,
        isActive: pathname === `/accounts/${a.id}`,
        action: <EditAccountDialog account={a} />,
        subtitle: formatCompactCurrency(getBalance(a.id)),
      })),
      footerAction: <CreateAccountDialog />,
    };
    return [...mainGroups, accountsGroup];
  }, [navGroups, accounts, pathname, getBalance]);

  return (
    <>
      <AppSidebar navGroups={allGroups} />
      <SidebarInset>{children}</SidebarInset>
    </>
  );
}

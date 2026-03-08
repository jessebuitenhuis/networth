"use client";

import {
  ArrowLeftRight,
  Landmark,
  Settings,
  Target,
  TrendingUp,
} from "lucide-react";

import { AccountProvider } from "@/accounts/AccountContext";
import { CategoryProvider } from "@/categories/CategoryContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { GoalProvider } from "@/goals/GoalContext";
import { RecurringTransactionProvider } from "@/recurring-transactions/RecurringTransactionContext";
import { ScenarioProvider } from "@/scenarios/ScenarioContext";
import { TransactionProvider } from "@/transactions/TransactionContext";

import { AppLayout } from "./AppLayout";
import type { NavGroup } from "./NavGroup.type";

const navGroups: NavGroup[] = [
  {
    label: "Planning",
    items: [
      { title: "Projections", url: "/planning", icon: <TrendingUp /> },
      { title: "Goals", url: "/goals", icon: <Target /> },
      { title: "Update Plan", url: "/setup", icon: <Settings /> },
    ],
  },
  {
    label: "Tracking",
    items: [
      { title: "Transactions", url: "/transactions", icon: <ArrowLeftRight /> },
      { title: "Accounts", url: "/accounts", icon: <Landmark /> },
    ],
  },
];

type SidebarLayoutProps = {
  defaultOpen: boolean;
  children: React.ReactNode;
};

export function SidebarLayout({ defaultOpen, children }: SidebarLayoutProps) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AccountProvider>
        <TransactionProvider>
          <ScenarioProvider>
            <RecurringTransactionProvider>
              <GoalProvider>
                <CategoryProvider>
                  <AppLayout navGroups={navGroups}>{children}</AppLayout>
                </CategoryProvider>
              </GoalProvider>
            </RecurringTransactionProvider>
          </ScenarioProvider>
        </TransactionProvider>
      </AccountProvider>
    </SidebarProvider>
  );
}

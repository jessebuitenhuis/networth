import "./globals.css";

import { GanttChart as GanttChartIcon, LayoutDashboard, Tag, Target, TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";

import { AccountProvider } from "@/accounts/AccountContext";
import { CategoryProvider } from "@/categories/CategoryContext";
import { AppLayout } from "@/components/layout/AppLayout";
import type { NavGroup } from "@/components/layout/NavGroup.type";
import { SidebarProvider } from "@/components/ui/sidebar";
import { GoalProvider } from "@/goals/GoalContext";
import { RecurringTransactionProvider } from "@/recurring-transactions/RecurringTransactionContext";
import { ScenarioProvider } from "@/scenarios/ScenarioContext";
import { TransactionProvider } from "@/transactions/TransactionContext";

export const metadata: Metadata = {
  title: "Net Worth",
  description: "Track your net worth",
};

const navGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", url: "/", icon: <LayoutDashboard /> },
      { title: "Planning", url: "/planning", icon: <TrendingUp /> },
      { title: "Timeline", url: "/timeline", icon: <GanttChartIcon /> },
      { title: "Goals", url: "/goals", icon: <Target /> },
      { title: "Categories", url: "/categories", icon: <Tag /> },
    ],
  },
];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <html lang="en">
      <body
        className="antialiased"
      >
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
      </body>
    </html>
  );
}

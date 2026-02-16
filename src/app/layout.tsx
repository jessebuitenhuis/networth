import "./globals.css";

import { LayoutDashboard, Target, TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";

import { AppLayout } from "@/components/layout/AppLayout";
import type { NavGroup } from "@/components/layout/NavGroup.type";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AccountProvider } from "@/accounts/AccountContext";
import { RecurringTransactionProvider } from "@/context/RecurringTransactionContext";
import { ScenarioProvider } from "@/scenarios/ScenarioContext";
import { TransactionProvider } from "@/context/TransactionContext";
import { GoalProvider } from "@/goals/GoalContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      { title: "Goals", url: "/goals", icon: <Target /> },
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarProvider defaultOpen={defaultOpen}>
          <AccountProvider>
            <TransactionProvider>
              <ScenarioProvider>
                <RecurringTransactionProvider>
                  <GoalProvider>
                    <AppLayout navGroups={navGroups}>{children}</AppLayout>
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

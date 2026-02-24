"use client";

import { useAccounts } from "@/accounts/AccountContext";
import { AccountBreakdownSection } from "@/accounts/components/AccountBreakdownSection";
import { NetWorthSummary } from "@/accounts/components/NetWorthSummary";
import { NetWorthChart } from "@/charts/components/NetWorthChart";
import TopBar from "@/components/layout/TopBar";
import { GoalProgressSection } from "@/goals/components/GoalProgressSection";
import { useSetupRedirect } from "@/onboarding/useSetupRedirect";
import { CreateTransactionDialog } from "@/transactions/components/CreateTransactionDialog";

export default function Home() {
  const { accounts } = useAccounts();
  const isReady = useSetupRedirect(accounts.length > 0);

  if (!isReady) return null;

  return (
    <>
      <TopBar title="Dashboard" />
      <div className="p-4">
        <div className="mx-auto max-w-2xl space-y-6">
          <CreateTransactionDialog />
          <NetWorthSummary />
          <AccountBreakdownSection />
          <NetWorthChart />
          <GoalProgressSection />
        </div>
      </div>
    </>
  );
}

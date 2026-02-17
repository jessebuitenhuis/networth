"use client";

import { useAccounts } from "@/accounts/AccountContext";
import { CreateAccountDialog } from "@/accounts/components/CreateAccountDialog";
import { EmptyDashboard } from "@/accounts/components/EmptyDashboard";
import { NetWorthSummary } from "@/accounts/components/NetWorthSummary";
import { NetWorthChart } from "@/charts/components/NetWorthChart";
import TopBar from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { GoalProgressSection } from "@/goals/components/GoalProgressSection";

export default function Home() {
  const { accounts } = useAccounts();

  return (
    <>
      <TopBar title="Dashboard" />
      <div className="p-4">
        <div className="mx-auto max-w-2xl space-y-6">
          {accounts.length === 0 ? (
            <EmptyDashboard
              createAccountTrigger={
                <CreateAccountDialog trigger={<Button>Get Started</Button>} />
              }
            />
          ) : (
            <>
              <NetWorthSummary />
              <NetWorthChart />
              <GoalProgressSection />
            </>
          )}
        </div>
      </div>
    </>
  );
}

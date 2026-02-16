"use client";

import { useAccounts } from "@/accounts/AccountContext";
import { CreateAccountDialog } from "@/components/accounts/CreateAccountDialog";
import { EmptyDashboard } from "@/components/accounts/EmptyDashboard";
import { NetWorthSummary } from "@/components/accounts/NetWorthSummary";
import { NetWorthChart } from "@/components/charts/NetWorthChart";
import { GoalProgressSection } from "@/components/goals/GoalProgressSection";
import TopBar from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";

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

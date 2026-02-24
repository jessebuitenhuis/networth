"use client";

import { useAccounts } from "@/accounts/AccountContext";
import { AccountBreakdownSection } from "@/accounts/components/AccountBreakdownSection";
import { CreateAccountDialog } from "@/accounts/components/CreateAccountDialog";
import { EmptyDashboard } from "@/accounts/components/EmptyDashboard";
import { NetWorthSummary } from "@/accounts/components/NetWorthSummary";
import { NetWorthChart } from "@/charts/components/NetWorthChart";
import TopBar from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { GoalProgressSection } from "@/goals/components/GoalProgressSection";
import { CreateTransactionDialog } from "@/transactions/components/CreateTransactionDialog";

export default function Home() {
  const { accounts } = useAccounts();

  return (
    <>
      <TopBar title="Dashboard" />
      <div className="p-6">
        <div className="mx-auto max-w-2xl space-y-8">
          {accounts.length === 0 ? (
            <div className="animate-fade-up">
              <EmptyDashboard
                createAccountTrigger={
                  <CreateAccountDialog trigger={<Button>Get Started</Button>} />
                }
              />
            </div>
          ) : (
            <>
              <div className="animate-fade-up">
                <CreateTransactionDialog />
              </div>
              <div className="animate-fade-up animation-delay-100">
                <NetWorthSummary />
              </div>
              <div className="animate-fade-up animation-delay-200">
                <AccountBreakdownSection />
              </div>
              <div className="animate-fade-up animation-delay-300">
                <NetWorthChart />
              </div>
              <div className="animate-fade-up animation-delay-400">
                <GoalProgressSection />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

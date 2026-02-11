"use client";

import { NetWorthSummary } from "@/components/accounts/NetWorthSummary";
import { NetWorthChart } from "@/components/charts/NetWorthChart";
import { AccountList } from "@/components/accounts/AccountList";

export default function Home() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <NetWorthSummary />
      <NetWorthChart />
      <AccountList />
    </div>
  );
}

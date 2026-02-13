"use client";

import { NetWorthSummary } from "@/components/accounts/NetWorthSummary";
import { NetWorthChart } from "@/components/charts/NetWorthChart";
import TopBar from "@/components/layout/TopBar";

export default function Home() {
  return (
    <>
      <TopBar title="Dashboard" />
      <div className="p-4">
        <div className="mx-auto max-w-2xl space-y-6">
          <NetWorthSummary />
          <NetWorthChart />
        </div>
      </div>
    </>
  );
}

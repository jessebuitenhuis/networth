"use client";

import TopBar from "@/components/layout/TopBar";
import { RecurringTransactionTimeline } from "@/recurring-transactions/components/RecurringTransactionTimeline";

export default function TimelinePage() {
  return (
    <>
      <TopBar title="Timeline" />
      <div className="p-4 space-y-6">
        <RecurringTransactionTimeline />
      </div>
    </>
  );
}

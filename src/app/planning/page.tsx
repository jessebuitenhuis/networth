"use client";

import { ProjectedNetWorthChart } from "@/components/charts/ProjectedNetWorthChart";

export default function PlanningPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Planning</h1>
      <ProjectedNetWorthChart />
    </div>
  );
}

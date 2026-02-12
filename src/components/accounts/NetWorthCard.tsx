"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/formatCurrency";
import { Card, CardContent } from "@/components/ui/card";

type NetWorthCardProps = {
  netWorth: number;
};

export function NetWorthCard({ netWorth }: NetWorthCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set mounted flag to avoid hydration mismatch with locale-dependent currency formatting.
    // Server renders with default locale, client needs to re-render with browser locale.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <Card className="p-6">
      <CardContent className="p-0">
        <h2 className="text-sm font-medium text-muted-foreground">
          Net Worth
        </h2>
        <p className="text-3xl font-bold">
          {mounted ? formatCurrency(netWorth) : "..."}
        </p>
      </CardContent>
    </Card>
  );
}

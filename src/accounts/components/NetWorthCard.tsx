"use client";

import { useEffect,useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatCurrency";

type NetWorthCardProps = {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
};

export function NetWorthCard({
  netWorth,
  totalAssets,
  totalLiabilities,
}: NetWorthCardProps) {
  const [isMounted, setMounted] = useState(false);

  useEffect(() => {
    // Set isMounted flag to avoid hydration mismatch with locale-dependent currency formatting.
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
          {isMounted ? formatCurrency(netWorth) : "..."}
        </p>
        <div className="mt-4 flex gap-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Assets
            </h3>
            <p className="text-lg font-semibold text-green-600">
              {isMounted ? formatCurrency(totalAssets) : "..."}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Liabilities
            </h3>
            <p className="text-lg font-semibold text-red-600">
              {isMounted ? formatCurrency(totalLiabilities) : "..."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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
    <Card className="hero-glow overflow-hidden p-0">
      <CardContent className="p-0">
        <div className="surface-hero relative px-8 py-8">
          <div className="surface-hero-glow pointer-events-none absolute inset-0 opacity-30" />
          <div className="relative">
            <h2 className="section-label">Net Worth</h2>
            <p className="hero-value mt-2 text-5xl font-normal leading-none">
              {isMounted ? formatCurrency(netWorth) : "..."}
            </p>
          </div>
        </div>
        <div className="flex border-t border-border">
          <div className="flex-1 border-r border-border px-8 py-5">
            <h3 className="section-label">Assets</h3>
            <p className="mt-1 font-display text-xl text-positive">
              {isMounted ? formatCurrency(totalAssets) : "..."}
            </p>
          </div>
          <div className="flex-1 px-8 py-5">
            <h3 className="section-label">Liabilities</h3>
            <p className="mt-1 font-display text-xl text-negative">
              {isMounted ? formatCurrency(totalLiabilities) : "..."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

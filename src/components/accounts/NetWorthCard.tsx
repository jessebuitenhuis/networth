import { formatCurrency } from "@/lib/formatCurrency";
import { Card, CardContent } from "@/components/ui/card";

type NetWorthCardProps = {
  netWorth: number;
};

export function NetWorthCard({ netWorth }: NetWorthCardProps) {
  return (
    <Card className="p-6">
      <CardContent className="p-0">
        <h2 className="text-sm font-medium text-muted-foreground">
          Net Worth
        </h2>
        <p className="text-3xl font-bold">{formatCurrency(netWorth)}</p>
      </CardContent>
    </Card>
  );
}

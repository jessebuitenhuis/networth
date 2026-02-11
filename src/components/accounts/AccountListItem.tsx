import { formatCurrency } from "@/lib/formatCurrency";
import { Card } from "@/components/ui/card";

type AccountListItemProps = {
  name: string;
  type: string;
  balance: number;
};

export function AccountListItem({
  name,
  type,
  balance,
}: AccountListItemProps) {
  return (
    <li>
      <Card className="flex items-center justify-between p-3">
        <div>
          <span className="font-medium">{name}</span>
          <span className="ml-2 text-sm text-muted-foreground">{type}</span>
        </div>
        <span className="font-mono">{formatCurrency(balance)}</span>
      </Card>
    </li>
  );
}

import { formatCurrency } from "@/lib/formatCurrency";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type AccountListItemProps = {
  name: string;
  type: string;
  balance: number;
  onRemove: () => void;
};

export function AccountListItem({
  name,
  type,
  balance,
  onRemove,
}: AccountListItemProps) {
  return (
    <li>
      <Card className="flex items-center justify-between p-3">
        <div>
          <span className="font-medium">{name}</span>
          <span className="ml-2 text-sm text-muted-foreground">{type}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono">{formatCurrency(balance)}</span>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            Remove
          </Button>
        </div>
      </Card>
    </li>
  );
}

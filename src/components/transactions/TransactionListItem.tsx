import { formatSignedCurrency } from "@/lib/formatSignedCurrency";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type TransactionListItemProps = {
  description: string;
  date: string;
  amount: number;
  onDelete: () => void;
};

export function TransactionListItem({
  description,
  date,
  amount,
  onDelete,
}: TransactionListItemProps) {
  return (
    <li>
      <Card className="flex items-center justify-between p-3">
        <div>
          <span className="font-medium">{description}</span>
          <span className="ml-2 text-sm text-muted-foreground">
            {new Date(date + "T00:00:00").toLocaleDateString("en-US")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`font-mono ${amount >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {formatSignedCurrency(amount)}
          </span>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </Card>
    </li>
  );
}

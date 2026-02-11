import { Repeat } from "lucide-react";
import { formatSignedCurrency } from "@/lib/formatSignedCurrency";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TransactionListItemProps = {
  description: string;
  date: string;
  amount: number;
  isProjected?: boolean;
  isRecurring?: boolean;
  editAction?: React.ReactNode;
};

export function TransactionListItem({
  description,
  date,
  amount,
  isProjected,
  isRecurring,
  editAction,
}: TransactionListItemProps) {
  return (
    <li>
      <Card className={cn("flex items-center justify-between p-3", isProjected && "border-dashed")}>
        <div>
          <span className={cn("font-medium", isProjected && "text-muted-foreground")}>{description}</span>
          <span className="ml-2 text-sm text-muted-foreground">
            {new Date(date + "T00:00:00").toLocaleDateString("en-US")}
          </span>
          {isRecurring && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Repeat className="h-3 w-3" />
              Recurring
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`font-mono ${amount >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {formatSignedCurrency(amount)}
          </span>
          {editAction}
        </div>
      </Card>
    </li>
  );
}

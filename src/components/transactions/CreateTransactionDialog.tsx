"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useTransactions } from "@/context/TransactionContext";
import { useRecurringTransactions } from "@/context/RecurringTransactionContext";
import { RecurrenceFrequency } from "@/models/RecurrenceFrequency";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type CreateTransactionDialogProps = {
  accountId: string;
};

export function CreateTransactionDialog({
  accountId,
}: CreateTransactionDialogProps) {
  const { addTransaction } = useTransactions();
  const { addRecurringTransaction } = useRecurringTransactions();
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [description, setDescription] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<RecurrenceFrequency>(
    RecurrenceFrequency.Monthly
  );
  const [endDate, setEndDate] = useState("");

  function resetForm() {
    setAmount(0);
    setDescription("");
    setIsRecurring(false);
    setFrequency(RecurrenceFrequency.Monthly);
    setEndDate("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (amount === 0) return;

    if (isRecurring) {
      addRecurringTransaction({
        id: crypto.randomUUID(),
        accountId,
        amount,
        description: description.trim(),
        frequency,
        startDate: date,
        endDate: endDate || undefined,
      });
    } else {
      addTransaction({
        id: crypto.randomUUID(),
        accountId,
        amount,
        date,
        description: description.trim(),
      });
    }

    resetForm();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="tx-amount" className="mb-2">
              Amount
            </Label>
            <Input
              id="tx-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="tx-date" className="mb-2">
              Date
            </Label>
            <Input
              id="tx-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="tx-description" className="mb-2">
              Description
            </Label>
            <Input
              id="tx-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Groceries"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="tx-recurring"
              checked={isRecurring}
              onCheckedChange={(checked) => setIsRecurring(checked === true)}
            />
            <Label htmlFor="tx-recurring">Recurring</Label>
          </div>
          {isRecurring && (
            <>
              <div>
                <Label id="tx-frequency-label" className="mb-2">
                  Frequency
                </Label>
                <Select
                  value={frequency}
                  onValueChange={(v) =>
                    setFrequency(v as RecurrenceFrequency)
                  }
                  aria-labelledby="tx-frequency-label"
                >
                  <SelectTrigger aria-label="Frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RecurrenceFrequency.Monthly}>
                      Monthly
                    </SelectItem>
                    <SelectItem value={RecurrenceFrequency.Yearly}>
                      Yearly
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tx-end-date" className="mb-2">
                  End Date
                </Label>
                <Input
                  id="tx-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </>
          )}
          <Button type="submit">Submit</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

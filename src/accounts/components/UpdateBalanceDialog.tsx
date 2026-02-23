"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";

import { computeBalance } from "@/accounts/computeBalance";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { DialogFooterActions } from "@/components/shared/DialogFooterActions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/dateUtils";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatSignedCurrency } from "@/lib/formatSignedCurrency";
import { generateId } from "@/lib/generateId";
import { filterTransactionsByScenario } from "@/transactions/filterTransactionsByScenario";
import type { Transaction } from "@/transactions/Transaction.type";

interface UpdateBalanceDialogProps {
  accountId: string;
  transactions: Transaction[];
  onSave: (transaction: Transaction) => void;
}

export function UpdateBalanceDialog({
  accountId,
  transactions,
  onSave,
}: UpdateBalanceDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newValue, setNewValue] = useState(0);
  const [description, setDescription] = useState("Balance adjustment");
  const [date, setDate] = useState(formatDate(new Date()));

  const baselineTransactions = filterTransactionsByScenario(transactions, null);
  const currentBalance = computeBalance(accountId, baselineTransactions, date);
  const adjustmentAmount = newValue - currentBalance;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setNewValue(0);
      setDescription("Balance adjustment");
      setDate(formatDate(new Date()));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (adjustmentAmount === 0) {
      return;
    }

    onSave({
      id: generateId(),
      accountId,
      amount: adjustmentAmount,
      date,
      description: description.trim(),
    });

    handleOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Update Balance
        </Button>
      </DialogTrigger>
      <DialogContent aria-labelledby="update-balance-title">
        <DialogHeader>
          <DialogTitle id="update-balance-title">Update Balance</DialogTitle>
          <DialogDescription>
            Enter the target balance to automatically calculate and create an adjustment transaction.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Current Balance:</Label>
            <div className="text-2xl font-semibold">
              {formatCurrency(currentBalance)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-value">New Balance</Label>
            <CurrencyInput
              id="new-value"
              aria-label="New Balance"
              value={newValue}
              onChange={setNewValue}
            />
          </div>

          <div className="space-y-2">
            <Label>Adjustment:</Label>
            <div className="text-xl font-semibold">
              {formatSignedCurrency(adjustmentAmount)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <DialogFooterActions
            onCancel={() => setIsOpen(false)}
            submitLabel="Update Balance"
            isSubmitDisabled={adjustmentAmount === 0}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}

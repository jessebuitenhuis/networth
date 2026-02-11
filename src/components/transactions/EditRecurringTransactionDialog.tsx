"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { useRecurringTransactions } from "@/context/RecurringTransactionContext";
import { useScenarios } from "@/context/ScenarioContext";
import type { RecurringTransaction } from "@/models/RecurringTransaction";
import { RecurrenceFrequency } from "@/models/RecurrenceFrequency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type EditRecurringTransactionDialogProps = {
  recurringTransaction: RecurringTransaction;
};

export function EditRecurringTransactionDialog({
  recurringTransaction,
}: EditRecurringTransactionDialogProps) {
  const { updateRecurringTransaction, removeRecurringTransaction } =
    useRecurringTransactions();
  const { scenarios } = useScenarios();
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(recurringTransaction.amount);
  const [description, setDescription] = useState(
    recurringTransaction.description
  );
  const [frequency, setFrequency] = useState<RecurrenceFrequency>(
    recurringTransaction.frequency
  );
  const [startDate, setStartDate] = useState(recurringTransaction.startDate);
  const [endDate, setEndDate] = useState(recurringTransaction.endDate || "");
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    recurringTransaction.scenarioId || scenarios[0]?.id || ""
  );

  function resetForm() {
    setAmount(recurringTransaction.amount);
    setDescription(recurringTransaction.description);
    setFrequency(recurringTransaction.frequency);
    setStartDate(recurringTransaction.startDate);
    setEndDate(recurringTransaction.endDate || "");
    setSelectedScenarioId(recurringTransaction.scenarioId || scenarios[0]?.id || "");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (amount === 0) return;

    updateRecurringTransaction({
      ...recurringTransaction,
      amount,
      description: description.trim(),
      frequency,
      startDate,
      endDate: endDate || undefined,
      scenarioId: selectedScenarioId || undefined,
    });
    setIsOpen(false);
  }

  function handleDelete() {
    removeRecurringTransaction(recurringTransaction.id);
    setIsOpen(false);
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Edit Transaction">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Edit Recurring Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-recurring-amount" className="mb-2">
              Amount
            </Label>
            <Input
              id="edit-recurring-amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              aria-label="Amount"
            />
          </div>
          <div>
            <Label htmlFor="edit-recurring-description" className="mb-2">
              Description
            </Label>
            <Input
              id="edit-recurring-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              aria-label="Description"
            />
          </div>
          <div>
            <Label id="edit-recurring-scenario-label" className="mb-2">
              Scenario
            </Label>
            <Select
              value={selectedScenarioId}
              onValueChange={setSelectedScenarioId}
              aria-labelledby="edit-recurring-scenario-label"
            >
              <SelectTrigger aria-label="Scenario">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {scenarios.map((scenario) => (
                  <SelectItem key={scenario.id} value={scenario.id}>
                    {scenario.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label id="edit-recurring-frequency-label" className="mb-2">
              Frequency
            </Label>
            <Select
              value={frequency}
              onValueChange={(v) => setFrequency(v as RecurrenceFrequency)}
              aria-labelledby="edit-recurring-frequency-label"
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
            <Label htmlFor="edit-recurring-start-date" className="mb-2">
              Start Date
            </Label>
            <Input
              id="edit-recurring-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              aria-label="Start Date"
            />
          </div>
          <div>
            <Label htmlFor="edit-recurring-end-date" className="mb-2">
              End Date (optional)
            </Label>
            <Input
              id="edit-recurring-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              aria-label="End Date (optional)"
            />
          </div>
          <div className="flex justify-between">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive">
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Delete Recurring Transaction
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this recurring transaction?
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

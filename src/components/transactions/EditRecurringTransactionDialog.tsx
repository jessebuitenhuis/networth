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
import { CurrencyInput } from "@/components/currency-input/CurrencyInput";
import { ScenarioSelect } from "./ScenarioSelect";
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
} from "@/components/ui/alert-dialog";

type EditRecurringTransactionDialogProps = {
  recurringTransaction: RecurringTransaction;
};

export function EditRecurringTransactionDialog({
  recurringTransaction,
}: EditRecurringTransactionDialogProps) {
  const { updateRecurringTransaction, removeRecurringTransaction } =
    useRecurringTransactions();
  const { scenarios, addScenario } = useScenarios();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
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
    recurringTransaction.scenarioId || "none"
  );

  function resetForm() {
    setAmount(recurringTransaction.amount);
    setDescription(recurringTransaction.description);
    setFrequency(recurringTransaction.frequency);
    setStartDate(recurringTransaction.startDate);
    setEndDate(recurringTransaction.endDate || "");
    setSelectedScenarioId(recurringTransaction.scenarioId || "none");
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
      scenarioId: selectedScenarioId === "none" ? undefined : selectedScenarioId,
    });
    setIsOpen(false);
  }

  function handleDeleteClick() {
    setIsOpen(false);
    setIsDeleteOpen(true);
  }

  function handleDelete() {
    removeRecurringTransaction(recurringTransaction.id);
    setIsDeleteOpen(false);
  }

  function handleCreateScenario(name: string): string {
    const id = crypto.randomUUID();
    addScenario({ id, name });
    return id;
  }

  return (
    <>
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
              <CurrencyInput
                id="edit-recurring-amount"
                aria-label="Amount"
                value={amount}
                onChange={setAmount}
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
            <ScenarioSelect
              scenarios={scenarios}
              value={selectedScenarioId}
              onValueChange={setSelectedScenarioId}
              onCreateScenario={handleCreateScenario}
            />
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
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteClick}
            >
              Delete
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <AlertDialog
      open={isDeleteOpen}
      onOpenChange={(open) => {
        if (!open) {
          setIsDeleteOpen(false);
          setIsOpen(true);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Recurring Transaction</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this recurring transaction? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
}

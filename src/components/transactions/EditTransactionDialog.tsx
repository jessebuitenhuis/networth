"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";

import { CurrencyInput } from "@/components/currency-input/CurrencyInput";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useScenarios } from "@/context/ScenarioContext";
import { useTransactions } from "@/context/TransactionContext";
import { generateId } from "@/lib/generateId";
import type { Transaction } from "@/transactions/Transaction.type";

import { ScenarioSelect } from "./ScenarioSelect";

type EditTransactionDialogProps = {
  transaction: Transaction;
};

export function EditTransactionDialog({
  transaction,
}: EditTransactionDialogProps) {
  const { updateTransaction, removeTransaction } = useTransactions();
  const { scenarios, addScenario } = useScenarios();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [amount, setAmount] = useState(transaction.amount);
  const [date, setDate] = useState(transaction.date);
  const [description, setDescription] = useState(transaction.description);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    transaction.scenarioId || "none"
  );

  function resetForm() {
    setAmount(transaction.amount);
    setDate(transaction.date);
    setDescription(transaction.description);
    setSelectedScenarioId(transaction.scenarioId || "none");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (amount === 0) return;

    updateTransaction({
      ...transaction,
      amount,
      date,
      description: description.trim(),
      scenarioId: selectedScenarioId === "none" ? undefined : selectedScenarioId,
    });
    setIsOpen(false);
  }

  function handleDeleteClick() {
    setIsOpen(false);
    setIsDeleteOpen(true);
  }

  function handleDelete() {
    removeTransaction(transaction.id);
    setIsDeleteOpen(false);
  }

  function handleCreateScenario(name: string): string {
    const id = generateId();
    addScenario({ id, name });
    return id;
  }

  function handleAlertDialogOpenChange(open: boolean) {
    if (!open) {
      setIsDeleteOpen(false);
      setIsOpen(true);
    }
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
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-transaction-amount" className="mb-2">
                Amount
              </Label>
              <CurrencyInput
                id="edit-transaction-amount"
                aria-label="Amount"
                value={amount}
                onChange={setAmount}
              />
            </div>
            <div>
              <Label htmlFor="edit-transaction-date" className="mb-2">
                Date
              </Label>
              <Input
                id="edit-transaction-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                aria-label="Date"
              />
            </div>
            <div>
              <Label htmlFor="edit-transaction-description" className="mb-2">
                Description
              </Label>
              <Input
                id="edit-transaction-description"
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
      <AlertDialog open={isDeleteOpen} onOpenChange={handleAlertDialogOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action
              cannot be undone.
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

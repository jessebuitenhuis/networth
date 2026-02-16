"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";

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
import { useRecurringTransactions } from "@/recurring-transactions/RecurringTransactionContext";
import { useScenarios } from "@/scenarios/ScenarioContext";
import { useTransactions } from "@/transactions/TransactionContext";
import type { Scenario } from "@/scenarios/Scenario.type";

type EditScenarioDialogProps = {
  scenario: Scenario;
  onDelete?: (id: string) => void;
};

export function EditScenarioDialog({ scenario, onDelete }: EditScenarioDialogProps) {
  const { updateScenario, removeScenario } = useScenarios();
  const { removeTransactionsByScenarioId } = useTransactions();
  const { removeRecurringTransactionsByScenarioId } = useRecurringTransactions();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [name, setName] = useState(scenario.name);

  function resetForm() {
    setName(scenario.name);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    updateScenario(scenario.id, name.trim());
    setIsOpen(false);
  }

  function handleDeleteClick() {
    setIsOpen(false);
    setIsDeleteConfirmOpen(true);
  }

  function handleCancelDelete() {
    setIsDeleteConfirmOpen(false);
    setIsOpen(true);
  }

  function handleDelete() {
    removeTransactionsByScenarioId(scenario.id);
    removeRecurringTransactionsByScenarioId(scenario.id);
    removeScenario(scenario.id);
    onDelete?.(scenario.id);
    setIsDeleteConfirmOpen(false);
  }

  function handleTriggerClick(e: React.MouseEvent) {
    e.stopPropagation();
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
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            aria-label="Edit Scenario"
            onClick={handleTriggerClick}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Edit Scenario</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-scenario-name" className="mb-2">
                Name
              </Label>
              <Input
                id="edit-scenario-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
        open={isDeleteConfirmOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCancelDelete();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scenario</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? All associated transactions will be permanently removed.
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

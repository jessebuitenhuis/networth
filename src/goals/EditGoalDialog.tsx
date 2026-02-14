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

import type { Goal } from "./Goal.type";
import { useGoals } from "./GoalContext";

type EditGoalDialogProps = {
  goal: Goal;
  onDelete?: (id: string) => void;
};

export function EditGoalDialog({ goal, onDelete }: EditGoalDialogProps) {
  const { updateGoal, removeGoal } = useGoals();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [name, setName] = useState(goal.name);
  const [targetAmount, setTargetAmount] = useState(goal.targetAmount);

  function resetForm() {
    setName(goal.name);
    setTargetAmount(goal.targetAmount);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    updateGoal({
      id: goal.id,
      name: name.trim(),
      targetAmount,
    });
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
    removeGoal(goal.id);
    onDelete?.(goal.id);
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
            aria-label="Edit Goal"
            onClick={handleTriggerClick}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-goal-name" className="mb-2">
                Name
              </Label>
              <Input
                id="edit-goal-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-goal-target-amount" className="mb-2">
                Target Amount
              </Label>
              <CurrencyInput
                id="edit-goal-target-amount"
                aria-label="Target Amount"
                value={targetAmount}
                onChange={setTargetAmount}
                showSignToggle={false}
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
            <AlertDialogTitle>Delete Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this goal? This action cannot be
              undone.
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

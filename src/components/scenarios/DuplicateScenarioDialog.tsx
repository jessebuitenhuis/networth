"use client";

import { Copy } from "lucide-react";
import { useState } from "react";

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
import { generateId } from "@/lib/generateId";

type DuplicateScenarioDialogProps = {
  scenarioId: string;
  onDuplicate?: (newId: string) => void;
};

export function DuplicateScenarioDialog({
  scenarioId,
  onDuplicate,
}: DuplicateScenarioDialogProps) {
  const { scenarios, addScenario } = useScenarios();
  const { transactions, addTransaction } = useTransactions();
  const { recurringTransactions, addRecurringTransaction } =
    useRecurringTransactions();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");

  const scenario = scenarios.find((s) => s.id === scenarioId);

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (open && scenario) {
      setName(`${scenario.name} (Copy)`);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const newScenarioId = generateId();

    addScenario({
      id: newScenarioId,
      name: trimmedName,
    });

    // Copy transactions
    transactions
      .filter((t) => t.scenarioId === scenarioId)
      .forEach((t) => {
        addTransaction({
          ...t,
          id: generateId(),
          scenarioId: newScenarioId,
        });
      });

    // Copy recurring transactions
    recurringTransactions
      .filter((rt) => rt.scenarioId === scenarioId)
      .forEach((rt) => {
        addRecurringTransaction({
          ...rt,
          id: generateId(),
          scenarioId: newScenarioId,
        });
      });

    onDuplicate?.(newScenarioId);
    setIsOpen(false);
  }

  function handleTriggerClick(e: React.MouseEvent) {
    e.stopPropagation();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={handleTriggerClick}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Duplicate Scenario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scenario-name">Name</Label>
            <Input
              id="scenario-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter scenario name"
              autoComplete="off"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Duplicate
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

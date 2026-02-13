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
import { useRecurringTransactions } from "@/context/RecurringTransactionContext";
import { useScenarios } from "@/context/ScenarioContext";
import { useTransactions } from "@/context/TransactionContext";

export function DuplicateScenarioDialog() {
  const { scenarios, activeScenarioId, addScenario, setActiveScenario } =
    useScenarios();
  const { transactions, addTransaction } = useTransactions();
  const { recurringTransactions, addRecurringTransaction } =
    useRecurringTransactions();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");

  const activeScenario = scenarios.find((s) => s.id === activeScenarioId);

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (open && activeScenario) {
      setName(`${activeScenario.name} (Copy)`);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const newScenarioId = crypto.randomUUID();

    addScenario({
      id: newScenarioId,
      name: trimmedName,
    });

    // Copy transactions
    transactions
      .filter((t) => t.scenarioId === activeScenarioId)
      .forEach((t) => {
        addTransaction({
          ...t,
          id: crypto.randomUUID(),
          scenarioId: newScenarioId,
        });
      });

    // Copy recurring transactions
    recurringTransactions
      .filter((rt) => rt.scenarioId === activeScenarioId)
      .forEach((rt) => {
        addRecurringTransaction({
          ...rt,
          id: crypto.randomUUID(),
          scenarioId: newScenarioId,
        });
      });

    setActiveScenario(newScenarioId);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={!activeScenarioId}>
          <Copy />
          Duplicate
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

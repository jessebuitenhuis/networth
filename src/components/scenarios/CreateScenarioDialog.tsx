"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useScenarios } from "@/context/ScenarioContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type CreateScenarioDialogProps = {
  onCreate?: (id: string) => void;
};

export function CreateScenarioDialog({ onCreate }: CreateScenarioDialogProps = {}) {
  const { addScenario, setActiveScenario } = useScenarios();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");

  function resetForm() {
    setName("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const scenarioId = crypto.randomUUID();

    addScenario({
      id: scenarioId,
      name: name.trim(),
    });

    setActiveScenario(scenarioId);
    onCreate?.(scenarioId);

    resetForm();
    setIsOpen(false);
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (open) {
      resetForm();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          New Scenario
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Create Scenario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scenario-name">Name</Label>
            <Input
              id="scenario-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Optimistic, Conservative"
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
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

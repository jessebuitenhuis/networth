"use client";

import { Copy } from "lucide-react";
import { useState } from "react";

import { DialogFooterActions } from "@/components/shared/DialogFooterActions";
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

type DuplicateScenarioDialogProps = {
  scenarioName?: string;
  onSubmit: (name: string) => void;
};

export function DuplicateScenarioDialog({
  scenarioName,
  onSubmit,
}: DuplicateScenarioDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (open && scenarioName) {
      setName(`${scenarioName} (Copy)`);
    } else if (open) {
      setName("");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    onSubmit(trimmedName);
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
          aria-label="Duplicate Scenario"
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
          <DialogFooterActions
            onCancel={() => setIsOpen(false)}
            submitLabel="Duplicate"
            isSubmitDisabled={!name.trim()}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}

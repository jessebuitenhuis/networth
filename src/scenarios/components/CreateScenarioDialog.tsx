"use client";

import { Plus } from "lucide-react";
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

type CreateScenarioDialogProps = {
  onSubmit: (name: string) => void;
};

export function CreateScenarioDialog({ onSubmit }: CreateScenarioDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");

  function resetForm() {
    setName("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit(name.trim());

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
          <DialogFooterActions
            onCancel={() => setIsOpen(false)}
            submitLabel="Create"
            isSubmitDisabled={!name.trim()}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}

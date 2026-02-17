"use client";

import { useEffect, useRef,useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Scenario } from "@/scenarios/Scenario.type";

type ScenarioSelectProps = {
  scenarios: Scenario[];
  value: string;
  onValueChange: (value: string) => void;
  onCreateScenario: (name: string) => string;
};

const CREATE_SENTINEL = "__create_new__";

export function ScenarioSelect({
  scenarios,
  value,
  onValueChange,
  onCreateScenario,
}: ScenarioSelectProps) {
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreateMode) {
      inputRef.current?.focus();
    }
  }, [isCreateMode]);

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === CREATE_SENTINEL) {
      setIsCreateMode(true);
      setNewScenarioName("");
    } else {
      onValueChange(selectedValue);
    }
  };

  const handleCreate = () => {
    const trimmedName = newScenarioName.trim();
    if (trimmedName) {
      const newId = onCreateScenario(trimmedName);
      onValueChange(newId);
      setIsCreateMode(false);
      setNewScenarioName("");
    }
  };

  const handleCancel = () => {
    setIsCreateMode(false);
    setNewScenarioName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreate();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const isCreateDisabled = newScenarioName.trim() === "";

  if (isCreateMode) {
    return (
      <div className="space-y-2">
        <Label htmlFor="scenario-name">Scenario Name</Label>
        <Input
          id="scenario-name"
          ref={inputRef}
          value={newScenarioName}
          onChange={(e) => setNewScenarioName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter scenario name..."
          autoComplete="off"
        />
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleCreate}
            disabled={isCreateDisabled}
            size="sm"
          >
            Create
          </Button>
          <Button
            type="button"
            onClick={handleCancel}
            variant="outline"
            size="sm"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="scenario-select">Scenario</Label>
      <Select value={value} onValueChange={handleSelectChange}>
        <SelectTrigger id="scenario-select">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None (Baseline)</SelectItem>
          {scenarios.map((scenario) => (
            <SelectItem key={scenario.id} value={scenario.id}>
              {scenario.name}
            </SelectItem>
          ))}
          <SelectSeparator />
          <SelectItem value={CREATE_SENTINEL}>Create new scenario...</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

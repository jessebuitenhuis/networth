import { useState } from "react";

import type { Category } from "@/categories/Category.type";
import { CategorySelect } from "@/categories/components/CategorySelect";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RECURRENCE_FREQUENCY_OPTIONS } from "@/recurring-transactions/frequencyOptions";
import { RecurrenceFrequency } from "@/recurring-transactions/RecurrenceFrequency";
import type { Scenario } from "@/scenarios/Scenario.type";

import { ScenarioSelect } from "./ScenarioSelect";

type CreateRecurringTransactionFormProps = {
  amount: number;
  onAmountChange: (value: number) => void;
  date: string;
  onDateChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  selectedCategoryId: string;
  onCategoryChange: (value: string) => void;
  selectedScenarioId: string;
  onScenarioChange: (value: string) => void;
  scenarios: Scenario[];
  categories: Category[];
  onCreateScenario: (name: string) => string;
  onCreateCategory: (name: string, parentCategoryId?: string) => string;
  onSubmit: (frequency: RecurrenceFrequency, endDate: string | undefined) => void;
};

export function CreateRecurringTransactionForm({
  amount,
  onAmountChange,
  date,
  onDateChange,
  description,
  onDescriptionChange,
  selectedCategoryId,
  onCategoryChange,
  selectedScenarioId,
  onScenarioChange,
  scenarios,
  categories,
  onCreateScenario,
  onCreateCategory,
  onSubmit,
}: CreateRecurringTransactionFormProps) {
  const [frequency, setFrequency] = useState<RecurrenceFrequency>(
    RecurrenceFrequency.Monthly,
  );
  const [endDate, setEndDate] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (amount === 0) return;
    onSubmit(frequency, endDate || undefined);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="tx-amount" className="mb-2">
          Amount
        </Label>
        <CurrencyInput
          id="tx-amount"
          aria-label="Amount"
          value={amount}
          onChange={onAmountChange}
        />
      </div>
      <div>
        <Label htmlFor="tx-date" className="mb-2">
          Start Date
        </Label>
        <Input
          id="tx-date"
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="tx-description" className="mb-2">
          Description
        </Label>
        <Input
          id="tx-description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="e.g. Groceries"
        />
      </div>
      <CategorySelect
        categories={categories}
        value={selectedCategoryId}
        onValueChange={onCategoryChange}
        onCreateCategory={onCreateCategory}
      />
      <ScenarioSelect
        scenarios={scenarios}
        value={selectedScenarioId}
        onValueChange={onScenarioChange}
        onCreateScenario={onCreateScenario}
      />
      <div>
        <Label id="tx-frequency-label" className="mb-2">
          Frequency
        </Label>
        <Select
          value={frequency}
          onValueChange={(v) => setFrequency(v as RecurrenceFrequency)}
          aria-labelledby="tx-frequency-label"
        >
          <SelectTrigger aria-label="Frequency">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RECURRENCE_FREQUENCY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="tx-end-date" className="mb-2">
          End Date
        </Label>
        <Input
          id="tx-end-date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      <Button type="submit">Submit</Button>
    </form>
  );
}

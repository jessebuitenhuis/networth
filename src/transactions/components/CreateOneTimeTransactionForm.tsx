import type { Category } from "@/categories/Category.type";
import { CategorySelect } from "@/categories/components/CategorySelect";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Scenario } from "@/scenarios/Scenario.type";

import { ScenarioSelect } from "./ScenarioSelect";

type CreateOneTimeTransactionFormProps = {
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
  onSubmit: (e: React.FormEvent) => void;
};

export function CreateOneTimeTransactionForm({
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
}: CreateOneTimeTransactionFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
          Date
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
      <Button type="submit">Submit</Button>
    </form>
  );
}

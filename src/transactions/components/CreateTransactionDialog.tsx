"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { useAccounts } from "@/accounts/AccountContext";
import { AccountSelect } from "@/accounts/components/AccountSelect";
import { useCategories } from "@/categories/CategoryContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { generateId } from "@/lib/generateId";
import type { RecurrenceFrequency } from "@/recurring-transactions/RecurrenceFrequency";
import { useRecurringTransactions } from "@/recurring-transactions/RecurringTransactionContext";
import { useScenarios } from "@/scenarios/ScenarioContext";
import { useTransactions } from "@/transactions/TransactionContext";

import { CreateOneTimeTransactionForm } from "./CreateOneTimeTransactionForm";
import { CreateRecurringTransactionForm } from "./CreateRecurringTransactionForm";

type CreateTransactionDialogProps = {
  accountId?: string;
};

export function CreateTransactionDialog({
  accountId,
}: CreateTransactionDialogProps) {
  const { accounts } = useAccounts();
  const { addTransaction } = useTransactions();
  const { addRecurringTransaction } = useRecurringTransactions();
  const { scenarios, addScenario } = useScenarios();
  const { categories, addCategory } = useCategories();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState("none");
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [description, setDescription] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("none");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("none");
  const [hasAccountError, setHasAccountError] = useState(false);

  const isAccountPicker = !accountId;
  const effectiveAccountId = accountId ?? selectedAccountId;

  function handleAccountChange(value: string) {
    setSelectedAccountId(value);
    setHasAccountError(false);
  }

  function resetForm() {
    setSelectedAccountId("none");
    setAmount(0);
    setDescription("");
    setIsRecurring(false);
    setSelectedScenarioId("none");
    setSelectedCategoryId("none");
    setHasAccountError(false);
  }

  function handleCreateScenario(name: string): string {
    const id = generateId();
    addScenario({ id, name });
    return id;
  }

  function handleCreateCategory(name: string, parentCategoryId?: string): string {
    const id = generateId();
    addCategory({ id, name, parentCategoryId });
    return id;
  }

  const scenarioId = selectedScenarioId === "none" ? undefined : selectedScenarioId;
  const categoryId = selectedCategoryId === "none" ? undefined : selectedCategoryId;

  function handleOneTimeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isAccountPicker && effectiveAccountId === "none") {
      setHasAccountError(true);
      return;
    }
    if (amount === 0) return;
    addTransaction({
      id: generateId(),
      accountId: effectiveAccountId,
      amount,
      date,
      description: description.trim(),
      scenarioId,
      categoryId,
    });
    resetForm();
    setIsOpen(false);
  }

  function handleRecurringSubmit(frequency: RecurrenceFrequency, endDate: string | undefined) {
    if (isAccountPicker && effectiveAccountId === "none") {
      setHasAccountError(true);
      return;
    }
    if (amount === 0) return;
    addRecurringTransaction({
      id: generateId(),
      accountId: effectiveAccountId,
      amount,
      description: description.trim(),
      frequency,
      startDate: date,
      endDate,
      scenarioId,
      categoryId,
    });
    resetForm();
    setIsOpen(false);
  }

  const sharedProps = {
    amount,
    onAmountChange: setAmount,
    date,
    onDateChange: setDate,
    description,
    onDescriptionChange: setDescription,
    selectedCategoryId,
    onCategoryChange: setSelectedCategoryId,
    selectedScenarioId,
    onScenarioChange: setSelectedScenarioId,
    scenarios,
    categories,
    onCreateScenario: handleCreateScenario,
    onCreateCategory: handleCreateCategory,
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        {isAccountPicker && (
          <AccountSelect
            accounts={accounts}
            value={selectedAccountId}
            onValueChange={handleAccountChange}
            hasError={hasAccountError}
          />
        )}
        <div className="flex items-center gap-2 mb-4">
          <Checkbox
            id="tx-recurring"
            checked={isRecurring}
            onCheckedChange={(checked) => setIsRecurring(checked === true)}
          />
          <Label htmlFor="tx-recurring">Recurring</Label>
        </div>
        {isRecurring ? (
          <CreateRecurringTransactionForm
            {...sharedProps}
            onSubmit={handleRecurringSubmit}
          />
        ) : (
          <CreateOneTimeTransactionForm
            {...sharedProps}
            onSubmit={handleOneTimeSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

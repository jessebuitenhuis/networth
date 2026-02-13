"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { CurrencyInput } from "@/components/currency-input/CurrencyInput";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarGroupAction } from "@/components/ui/sidebar";
import { useAccounts } from "@/context/AccountContext";
import { useTransactions } from "@/context/TransactionContext";
import { generateId } from "@/lib/generateId";
import { AccountType } from "@/models/AccountType";

export function CreateAccountDialog() {
  const { addAccount } = useAccounts();
  const { addTransaction } = useTransactions();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>(AccountType.Asset);
  const [balance, setBalance] = useState(0);

  function resetForm() {
    setName("");
    setBalance(0);
    setType(AccountType.Asset);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const accountId = generateId();

    addAccount({
      id: accountId,
      name: name.trim(),
      type,
    });

    if (balance !== 0) {
      addTransaction({
        id: generateId(),
        accountId,
        amount: balance,
        date: new Date().toISOString().split("T")[0],
        description: "Opening balance",
      });
    }

    resetForm();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <SidebarGroupAction aria-label="Add Account">
          <Plus />
        </SidebarGroupAction>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Add Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="account-name" className="mb-2">Name</Label>
            <Input
              id="account-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chase Checking"
            />
          </div>
          <div>
            <Label id="account-type-label" className="mb-2">Type</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as AccountType)}
              aria-labelledby="account-type-label"
            >
              <SelectTrigger aria-label="Type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AccountType.Asset}>Asset</SelectItem>
                <SelectItem value={AccountType.Liability}>Liability</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="account-balance" className="mb-2">Balance</Label>
            <CurrencyInput
              id="account-balance"
              aria-label="Balance"
              value={balance}
              onChange={setBalance}
            />
          </div>
          <Button type="submit">Add Account</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

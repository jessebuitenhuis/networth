"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useAccounts } from "@/context/AccountContext";
import { useTransactions } from "@/context/TransactionContext";
import { AccountType } from "@/models/AccountType";
import { SidebarGroupAction } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/currency-input/CurrencyInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

    const accountId = crypto.randomUUID();

    addAccount({
      id: accountId,
      name: name.trim(),
      type,
    });

    if (balance !== 0) {
      addTransaction({
        id: crypto.randomUUID(),
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

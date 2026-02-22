"use client";

import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import type { Account } from "@/accounts/Account.type";
import { useAccounts } from "@/accounts/AccountContext";
import { ACCOUNT_TYPE_OPTIONS } from "@/accounts/accountTypeOptions";
import { AccountType } from "@/accounts/AccountType";
import { PercentageInput } from "@/components/shared/PercentageInput";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { SidebarMenuAction } from "@/components/ui/sidebar";
import { useDeleteConfirmation } from "@/hooks/useDeleteConfirmation";
import { useTransactions } from "@/transactions/TransactionContext";

type EditAccountDialogProps = {
  account: Account;
};

export function EditAccountDialog({ account }: EditAccountDialogProps) {
  const { updateAccount, removeAccount } = useAccounts();
  const { removeTransactionsByAccountId } = useTransactions();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(account.name);
  const [type, setType] = useState<AccountType>(account.type);
  const [expectedReturnRate, setExpectedReturnRate] = useState(
    account.expectedReturnRate?.toString() ?? ""
  );

  const handleDelete = useCallback(() => {
    removeTransactionsByAccountId(account.id);
    removeAccount(account.id);
    router.push("/");
  }, [removeTransactionsByAccountId, removeAccount, account.id, router]);

  const {
    isDeleteConfirmOpen,
    handleDeleteClick,
    confirmDelete,
    handleDeleteDialogOpenChange,
  } = useDeleteConfirmation({
    onDelete: handleDelete,
    setIsEditDialogOpen: setIsOpen,
  });

  function resetForm() {
    setName(account.name);
    setType(account.type);
    setExpectedReturnRate(account.expectedReturnRate?.toString() ?? "");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    updateAccount({
      ...account,
      name: name.trim(),
      type,
      expectedReturnRate: expectedReturnRate ? Number(expectedReturnRate) : undefined,
    });
    setIsOpen(false);
  }

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (open) resetForm();
        }}
      >
        <DialogTrigger asChild>
          <SidebarMenuAction aria-label="Edit Account">
            <Pencil />
          </SidebarMenuAction>
        </DialogTrigger>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-account-name" className="mb-2">
                Name
              </Label>
              <Input
                id="edit-account-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label id="edit-account-type-label" className="mb-2">
                Type
              </Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as AccountType)}
                aria-labelledby="edit-account-type-label"
              >
                <SelectTrigger aria-label="Type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-expected-return-rate" className="mb-2">
                Expected Annual Rate{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <PercentageInput
                id="edit-expected-return-rate"
                aria-label="Expected Annual Rate (optional)"
                placeholder="e.g. 8"
                value={expectedReturnRate}
                onChange={setExpectedReturnRate}
              />
            </div>
            <div className="flex justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteClick}
              >
                Delete
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteConfirmOpen}
        onOpenChange={handleDeleteDialogOpenChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this account? All transactions
              will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

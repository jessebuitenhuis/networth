"use client";

import { useMemo, useState } from "react";

import TopBar from "@/components/layout/TopBar";
import { CreateTransactionDialog } from "@/transactions/components/CreateTransactionDialog";
import { TransactionFilterBar } from "@/transactions/components/TransactionFilterBar";
import { TransactionTable } from "@/transactions/components/TransactionTable";
import { filterDisplayTransactions } from "@/transactions/filterDisplayTransactions";
import {
  emptyFilters,
  type TransactionFilters,
} from "@/transactions/TransactionFilters.type";
import { useAllDisplayTransactions } from "@/transactions/useAllDisplayTransactions";

export default function TransactionsPage() {
  const allItems = useAllDisplayTransactions();
  const [filters, setFilters] = useState<TransactionFilters>(emptyFilters);

  const filteredItems = useMemo(
    () => filterDisplayTransactions(allItems, filters),
    [allItems, filters]
  );

  return (
    <>
      <TopBar title="Transactions" actions={<CreateTransactionDialog />} />
      <div className="p-4">
        <div className="mx-auto max-w-2xl space-y-4">
          {allItems.length === 0 ? (
            <p className="text-muted-foreground">No transactions yet.</p>
          ) : (
            <>
              <TransactionFilterBar
                filters={filters}
                onChange={setFilters}
                resultCount={filteredItems.length}
                totalCount={allItems.length}
              />
              {filteredItems.length === 0 ? (
                <p className="text-muted-foreground">
                  No transactions match the current filters.
                </p>
              ) : (
                <TransactionTable items={filteredItems} showAccountColumn />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

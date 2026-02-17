import { vi } from "vitest";

import type { Account } from "@/accounts/Account.type";
import type { Goal } from "@/goals/Goal.type";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import type { Scenario } from "@/scenarios/Scenario.type";
import type { Transaction } from "@/transactions/Transaction.type";

type ApiData = {
  accounts?: Account[];
  transactions?: Transaction[];
  recurringTransactions?: RecurringTransaction[];
  scenarios?: Scenario[];
  activeScenarioId?: string | null;
  goals?: Goal[];
};

export function mockApiResponses(data: ApiData = {}) {
  const {
    accounts = [],
    transactions = [],
    recurringTransactions = [],
    scenarios = [],
    activeScenarioId = null,
    goals = [],
  } = data;

  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      const method = init?.method ?? "GET";

      if (method !== "GET") {
        return { ok: true, status: method === "POST" ? 201 : 200, json: async () => ({}) };
      }

      if (url === "/api/accounts") {
        return { ok: true, json: async () => accounts };
      }
      if (url === "/api/transactions") {
        return { ok: true, json: async () => transactions };
      }
      if (url === "/api/recurring-transactions") {
        return { ok: true, json: async () => recurringTransactions };
      }
      if (url === "/api/scenarios") {
        return { ok: true, json: async () => ({ scenarios, activeScenarioId }) };
      }
      if (url === "/api/goals") {
        return { ok: true, json: async () => goals };
      }

      return { ok: true, status: 200, json: async () => [] };
    }),
  );
}

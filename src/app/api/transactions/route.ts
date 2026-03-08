import { NextResponse } from "next/server";

import { getCurrentUserId } from "@/auth/getCurrentUserId";
import {
  createTransaction,
  createTransactions,
  deleteTransactionsByAccountId,
  deleteTransactionsByScenarioId,
  getAllTransactions,
} from "@/transactions/transactionRepository";

export async function GET() {
  const userId = await getCurrentUserId();
  const rows = getAllTransactions(userId);
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    const body = await request.json();
    const items = Array.isArray(body) ? body : [body];

    for (const item of items) {
      if (!item.id || !item.accountId || item.amount == null || !item.date || !item.description) {
        return NextResponse.json(
          { error: "Missing required fields: id, accountId, amount, date, description" },
          { status: 400 },
        );
      }
    }

    if (Array.isArray(body)) {
      const created = createTransactions(userId, items);
      return NextResponse.json(created, { status: 201 });
    }

    const created = createTransaction(userId, items[0]);
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const userId = await getCurrentUserId();
  const url = new URL(request.url);
  const accountId = url.searchParams.get("accountId");
  const scenarioId = url.searchParams.get("scenarioId");

  if (!accountId && !scenarioId) {
    return NextResponse.json(
      { error: "Query parameter accountId or scenarioId required" },
      { status: 400 },
    );
  }

  if (accountId) {
    deleteTransactionsByAccountId(userId, accountId);
  }

  if (scenarioId) {
    deleteTransactionsByScenarioId(userId, scenarioId);
  }

  return new NextResponse(null, { status: 204 });
}

import { NextResponse } from "next/server";

import { transactionRepo } from "@/transactions/transactionRepository";

export async function GET() {
  const rows = await transactionRepo.getAll();
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  try {
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
      const created = await transactionRepo.createTransactions(items);
      return NextResponse.json(created, { status: 201 });
    }

    const created = await transactionRepo.createTransaction(items[0]);
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
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
    await transactionRepo.deleteByAccountId(accountId);
  }

  if (scenarioId) {
    await transactionRepo.deleteByScenarioId(scenarioId);
  }

  return new NextResponse(null, { status: 204 });
}

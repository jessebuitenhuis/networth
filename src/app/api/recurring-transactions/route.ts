import { NextResponse } from "next/server";

import { getCurrentUserId } from "@/auth/getCurrentUserId";
import {
  createRecurringTransaction,
  deleteRecurringTransactionsByScenarioId,
  getAllRecurringTransactions,
} from "@/recurring-transactions/recurringTransactionRepository";

export async function GET() {
  const userId = await getCurrentUserId();
  const rows = getAllRecurringTransactions(userId);
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    const body = await request.json();

    if (
      !body.id ||
      !body.accountId ||
      body.amount == null ||
      !body.description ||
      !body.frequency ||
      !body.startDate
    ) {
      return NextResponse.json(
        { error: "Missing required fields: id, accountId, amount, description, frequency, startDate" },
        { status: 400 },
      );
    }

    const created = createRecurringTransaction(userId, {
      id: body.id,
      accountId: body.accountId,
      amount: body.amount,
      description: body.description,
      frequency: body.frequency,
      startDate: body.startDate,
      endDate: body.endDate,
      scenarioId: body.scenarioId,
      categoryId: body.categoryId,
    });

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const userId = await getCurrentUserId();
  const url = new URL(request.url);
  const scenarioId = url.searchParams.get("scenarioId");

  if (!scenarioId) {
    return NextResponse.json(
      { error: "Query parameter scenarioId required" },
      { status: 400 },
    );
  }

  deleteRecurringTransactionsByScenarioId(userId, scenarioId);

  return new NextResponse(null, { status: 204 });
}

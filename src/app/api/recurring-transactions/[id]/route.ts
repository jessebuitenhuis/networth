import { NextResponse } from "next/server";

import { getCurrentUserId } from "@/auth/getCurrentUserId";
import {
  deleteRecurringTransaction,
  getRecurringTransactionById,
  updateRecurringTransaction,
} from "@/recurring-transactions/recurringTransactionRepository";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    const { id } = await params;
    const body = await request.json();

    const existing = getRecurringTransactionById(userId, id);

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = updateRecurringTransaction(userId, id, {
      accountId: body.accountId,
      amount: body.amount,
      description: body.description,
      frequency: body.frequency,
      startDate: body.startDate,
      endDate: body.endDate,
      scenarioId: body.scenarioId,
      categoryId: body.categoryId,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getCurrentUserId();
  const { id } = await params;

  const existing = getRecurringTransactionById(userId, id);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  deleteRecurringTransaction(userId, id);

  return new NextResponse(null, { status: 204 });
}

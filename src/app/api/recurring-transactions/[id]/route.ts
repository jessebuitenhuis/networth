import { NextResponse } from "next/server";

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
    const { id } = await params;
    const body = await request.json();

    const existing = getRecurringTransactionById(id);

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = updateRecurringTransaction(id, {
      accountId: body.accountId,
      amount: body.amount,
      description: body.description,
      frequency: body.frequency,
      startDate: body.startDate,
      endDate: body.endDate,
      scenarioId: body.scenarioId,
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
  const { id } = await params;

  const existing = getRecurringTransactionById(id);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  deleteRecurringTransaction(id);

  return new NextResponse(null, { status: 204 });
}

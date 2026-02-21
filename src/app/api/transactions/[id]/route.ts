import { NextResponse } from "next/server";

import {
  deleteTransaction,
  getTransactionById,
  updateTransaction,
} from "@/transactions/transactionRepository";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = getTransactionById(id);

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = updateTransaction(id, {
      accountId: body.accountId,
      amount: body.amount,
      date: body.date,
      description: body.description,
      isProjected: body.isProjected ?? null,
      scenarioId: body.scenarioId ?? null,
      categoryId: body.categoryId ?? null,
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

  const existing = getTransactionById(id);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  deleteTransaction(id);

  return new NextResponse(null, { status: 204 });
}

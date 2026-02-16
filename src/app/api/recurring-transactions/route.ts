import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db/connection";
import { recurringTransactions } from "@/db/schema";

export async function GET() {
  const rows = db.select().from(recurringTransactions).all();
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  try {
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

    db.insert(recurringTransactions)
      .values({
        id: body.id,
        accountId: body.accountId,
        amount: body.amount,
        description: body.description,
        frequency: body.frequency,
        startDate: body.startDate,
        endDate: body.endDate ?? null,
        scenarioId: body.scenarioId ?? null,
      })
      .run();

    const [created] = db
      .select()
      .from(recurringTransactions)
      .where(eq(recurringTransactions.id, body.id))
      .all();

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const scenarioId = url.searchParams.get("scenarioId");

  if (!scenarioId) {
    return NextResponse.json(
      { error: "Query parameter scenarioId required" },
      { status: 400 },
    );
  }

  db.delete(recurringTransactions)
    .where(eq(recurringTransactions.scenarioId, scenarioId))
    .run();

  return new NextResponse(null, { status: 204 });
}

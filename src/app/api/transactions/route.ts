import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db/connection";
import { transactions } from "@/db/schema";

export async function GET() {
  const rows = db.select().from(transactions).all();
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

    for (const item of items) {
      db.insert(transactions)
        .values({
          id: item.id,
          accountId: item.accountId,
          amount: item.amount,
          date: item.date,
          description: item.description,
          isProjected: item.isProjected ?? null,
          scenarioId: item.scenarioId ?? null,
        })
        .run();
    }

    const ids = items.map((item) => item.id);
    const created = db
      .select()
      .from(transactions)
      .all()
      .filter((row) => ids.includes(row.id));

    return NextResponse.json(
      Array.isArray(body) ? created : created[0],
      { status: 201 },
    );
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
    db.delete(transactions).where(eq(transactions.accountId, accountId)).run();
  }

  if (scenarioId) {
    db.delete(transactions).where(eq(transactions.scenarioId, scenarioId)).run();
  }

  return new NextResponse(null, { status: 204 });
}

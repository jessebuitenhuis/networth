import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db/connection";
import { accounts } from "@/db/schema";

export async function GET() {
  const rows = db.select().from(accounts).all();
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.id || !body.name || !body.type) {
      return NextResponse.json(
        { error: "Missing required fields: id, name, type" },
        { status: 400 },
      );
    }

    db.insert(accounts)
      .values({
        id: body.id,
        name: body.name,
        type: body.type,
        expectedReturnRate: body.expectedReturnRate ?? null,
      })
      .run();

    const [created] = db
      .select()
      .from(accounts)
      .where(eq(accounts.id, body.id))
      .all();

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

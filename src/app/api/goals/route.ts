import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db/connection";
import { goals } from "@/db/schema";

export async function GET() {
  const rows = db.select().from(goals).all();
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.id || !body.name || body.targetAmount == null) {
      return NextResponse.json(
        { error: "Missing required fields: id, name, targetAmount" },
        { status: 400 },
      );
    }

    db.insert(goals)
      .values({
        id: body.id,
        name: body.name,
        targetAmount: body.targetAmount,
      })
      .run();

    const [created] = db
      .select()
      .from(goals)
      .where(eq(goals.id, body.id))
      .all();

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

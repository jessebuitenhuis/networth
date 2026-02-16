import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db/connection";
import { goals } from "@/db/schema";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = db
      .select()
      .from(goals)
      .where(eq(goals.id, id))
      .all();

    if (existing.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    db.update(goals)
      .set({
        name: body.name,
        targetAmount: body.targetAmount,
      })
      .where(eq(goals.id, id))
      .run();

    const [updated] = db
      .select()
      .from(goals)
      .where(eq(goals.id, id))
      .all();

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

  const existing = db
    .select()
    .from(goals)
    .where(eq(goals.id, id))
    .all();

  if (existing.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  db.delete(goals).where(eq(goals.id, id)).run();

  return new NextResponse(null, { status: 204 });
}

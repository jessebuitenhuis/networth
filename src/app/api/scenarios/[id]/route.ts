import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db/connection";
import { scenarios } from "@/db/schema";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = db
      .select()
      .from(scenarios)
      .where(eq(scenarios.id, id))
      .all();

    if (existing.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    db.update(scenarios)
      .set({ name: body.name })
      .where(eq(scenarios.id, id))
      .run();

    const [updated] = db
      .select()
      .from(scenarios)
      .where(eq(scenarios.id, id))
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
    .from(scenarios)
    .where(eq(scenarios.id, id))
    .all();

  if (existing.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  db.delete(scenarios).where(eq(scenarios.id, id)).run();

  return new NextResponse(null, { status: 204 });
}

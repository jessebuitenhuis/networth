import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db/connection";
import { scenarios, settings } from "@/db/schema";
import { generateId } from "@/lib/generateId";

export async function GET() {
  let rows = db.select().from(scenarios).all();

  if (rows.length === 0) {
    const id = generateId();
    db.insert(scenarios).values({ id, name: "Base Plan" }).run();
    db.insert(settings)
      .values({ key: "activeScenarioId", value: id })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: id },
      })
      .run();
    rows = db.select().from(scenarios).all();
  }

  const activeRow = db
    .select()
    .from(settings)
    .where(eq(settings.key, "activeScenarioId"))
    .all();

  const activeScenarioId = activeRow[0]?.value ?? null;

  return NextResponse.json({ scenarios: rows, activeScenarioId });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.id || !body.name) {
      return NextResponse.json(
        { error: "Missing required fields: id, name" },
        { status: 400 },
      );
    }

    db.insert(scenarios)
      .values({ id: body.id, name: body.name })
      .run();

    const [created] = db
      .select()
      .from(scenarios)
      .where(eq(scenarios.id, body.id))
      .all();

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

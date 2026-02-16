import { NextResponse } from "next/server";

import { db } from "@/db/connection";
import { settings } from "@/db/schema";

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!body.scenarioId) {
      return NextResponse.json(
        { error: "Missing required field: scenarioId" },
        { status: 400 },
      );
    }

    db.insert(settings)
      .values({ key: "activeScenarioId", value: body.scenarioId })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: body.scenarioId },
      })
      .run();

    return NextResponse.json({ activeScenarioId: body.scenarioId });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

import { NextResponse } from "next/server";

import { getCurrentUserId } from "@/auth/getCurrentUserId";
import { setActiveScenarioId } from "@/scenarios/scenarioRepository";

export async function PUT(request: Request) {
  try {
    const userId = await getCurrentUserId();
    const body = await request.json();

    if (!body.scenarioId) {
      return NextResponse.json(
        { error: "Missing required field: scenarioId" },
        { status: 400 },
      );
    }

    setActiveScenarioId(userId, body.scenarioId);

    return NextResponse.json({ activeScenarioId: body.scenarioId });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

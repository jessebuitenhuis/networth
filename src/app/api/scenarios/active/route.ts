import { NextResponse } from "next/server";

import { setActiveScenarioId } from "@/scenarios/scenarioRepository";

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!body.scenarioId) {
      return NextResponse.json(
        { error: "Missing required field: scenarioId" },
        { status: 400 },
      );
    }

    setActiveScenarioId(body.scenarioId);

    return NextResponse.json({ activeScenarioId: body.scenarioId });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

import { NextResponse } from "next/server";

import { getCurrentUserId } from "@/auth/getCurrentUserId";
import {
  createScenario,
  ensureBasePlanExists,
  getActiveScenarioId,
  getAllScenarios,
} from "@/scenarios/scenarioRepository";

export async function GET() {
  const userId = await getCurrentUserId();
  ensureBasePlanExists(userId);

  const rows = getAllScenarios(userId);
  const activeScenarioId = getActiveScenarioId(userId);

  return NextResponse.json({ scenarios: rows, activeScenarioId });
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    const body = await request.json();

    if (!body.id || !body.name) {
      return NextResponse.json(
        { error: "Missing required fields: id, name" },
        { status: 400 },
      );
    }

    const created = createScenario(userId, { id: body.id, name: body.name, inflationRate: body.inflationRate });

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

import { NextResponse } from "next/server";

import {
  createScenario,
  ensureBasePlanExists,
  getActiveScenarioId,
  getAllScenarios,
} from "@/scenarios/scenarioRepository";

export async function GET() {
  await ensureBasePlanExists();

  const rows = await getAllScenarios();
  const activeScenarioId = await getActiveScenarioId();

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

    const created = await createScenario({ id: body.id, name: body.name, inflationRate: body.inflationRate });

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

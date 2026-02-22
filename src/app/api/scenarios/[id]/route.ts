import { NextResponse } from "next/server";

import {
  deleteScenario,
  getScenarioById,
  updateScenario,
} from "@/scenarios/scenarioRepository";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = getScenarioById(id);

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = updateScenario(id, { name: body.name, inflationRate: body.inflationRate });

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

  const existing = getScenarioById(id);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  deleteScenario(id);

  return new NextResponse(null, { status: 204 });
}

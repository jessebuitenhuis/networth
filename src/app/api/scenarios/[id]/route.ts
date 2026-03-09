import { NextResponse } from "next/server";

import { scenarioRepo } from "@/scenarios/scenarioRepository";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await scenarioRepo.getById(id);

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await scenarioRepo.updateScenario(id, { name: body.name, inflationRate: body.inflationRate });

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

  const existing = await scenarioRepo.getById(id);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await scenarioRepo.delete(id);

  return new NextResponse(null, { status: 204 });
}

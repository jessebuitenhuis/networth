import { NextResponse } from "next/server";

import { goalRepo } from "@/goals/goalRepository";

export async function GET() {
  const rows = await goalRepo.getAll();
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.id || !body.name || body.targetAmount == null) {
      return NextResponse.json(
        { error: "Missing required fields: id, name, targetAmount" },
        { status: 400 },
      );
    }

    const created = await goalRepo.createGoal({
      id: body.id,
      name: body.name,
      targetAmount: body.targetAmount,
    });

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

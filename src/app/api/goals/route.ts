import { NextResponse } from "next/server";

import { getCurrentUserId } from "@/auth/getCurrentUserId";
import { createGoal, getAllGoals } from "@/goals/goalRepository";

export async function GET() {
  const userId = await getCurrentUserId();
  const rows = getAllGoals(userId);
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    const body = await request.json();

    if (!body.id || !body.name || body.targetAmount == null) {
      return NextResponse.json(
        { error: "Missing required fields: id, name, targetAmount" },
        { status: 400 },
      );
    }

    const created = createGoal(userId, {
      id: body.id,
      name: body.name,
      targetAmount: body.targetAmount,
    });

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

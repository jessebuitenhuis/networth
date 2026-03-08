import { NextResponse } from "next/server";

import { getCurrentUserId } from "@/auth/getCurrentUserId";
import {
  deleteGoal,
  getGoalById,
  updateGoal,
} from "@/goals/goalRepository";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    const { id } = await params;
    const body = await request.json();

    const existing = getGoalById(userId, id);

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = updateGoal(userId, id, {
      name: body.name,
      targetAmount: body.targetAmount,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getCurrentUserId();
  const { id } = await params;

  const existing = getGoalById(userId, id);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  deleteGoal(userId, id);

  return new NextResponse(null, { status: 204 });
}

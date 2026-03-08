import { NextResponse } from "next/server";

import { getCurrentUserId } from "@/auth/getCurrentUserId";
import {
  getSetupCompleted,
  setSetupCompleted,
} from "@/onboarding/onboardingRepository";

export async function GET() {
  const userId = await getCurrentUserId();
  const completed = getSetupCompleted(userId);
  return NextResponse.json({ completed });
}

export async function POST() {
  const userId = await getCurrentUserId();
  setSetupCompleted(userId, true);
  return NextResponse.json({ completed: true }, { status: 200 });
}

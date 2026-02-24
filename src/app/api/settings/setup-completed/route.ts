import { NextResponse } from "next/server";

import {
  getSetupCompleted,
  setSetupCompleted,
} from "@/onboarding/onboardingRepository";

export async function GET() {
  const completed = getSetupCompleted();
  return NextResponse.json({ completed });
}

export async function POST() {
  setSetupCompleted(true);
  return NextResponse.json({ completed: true }, { status: 200 });
}

import { NextResponse } from "next/server";

import {
  getSetupCompleted,
  setSetupCompleted,
} from "@/onboarding/onboardingRepository";

export async function GET() {
  const completed = await getSetupCompleted();
  return NextResponse.json({ completed });
}

export async function POST() {
  await setSetupCompleted(true);
  return NextResponse.json({ completed: true }, { status: 200 });
}

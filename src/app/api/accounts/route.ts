import { NextResponse } from "next/server";

import { createAccount, getAllAccounts } from "@/accounts/accountRepository";
import { getCurrentUserId } from "@/auth/getCurrentUserId";

export async function GET() {
  const userId = await getCurrentUserId();
  const rows = getAllAccounts(userId);
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    const body = await request.json();

    if (!body.id || !body.name || !body.type) {
      return NextResponse.json(
        { error: "Missing required fields: id, name, type" },
        { status: 400 },
      );
    }

    const created = createAccount(userId, {
      id: body.id,
      name: body.name,
      type: body.type,
      expectedReturnRate: body.expectedReturnRate,
    });

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

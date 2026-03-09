import { NextResponse } from "next/server";

import { accountRepo } from "@/accounts/accountRepository";

export async function GET() {
  const rows = await accountRepo.getAll();
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.id || !body.name || !body.type) {
      return NextResponse.json(
        { error: "Missing required fields: id, name, type" },
        { status: 400 },
      );
    }

    const created = await accountRepo.createAccount({
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

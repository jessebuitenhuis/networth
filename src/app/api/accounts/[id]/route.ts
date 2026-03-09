import { NextResponse } from "next/server";

import { accountRepo } from "@/accounts/accountRepository";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await accountRepo.getById(id);

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await accountRepo.updateAccount(id, {
      name: body.name,
      type: body.type,
      expectedReturnRate: body.expectedReturnRate,
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
  const { id } = await params;

  const existing = await accountRepo.getById(id);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await accountRepo.delete(id);

  return new NextResponse(null, { status: 204 });
}

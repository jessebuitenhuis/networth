import { NextResponse } from "next/server";

import { categoryRepo } from "@/categories/categoryRepository";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await categoryRepo.getById(id);

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await categoryRepo.updateCategory(id, {
      name: body.name,
      parentCategoryId: body.parentCategoryId,
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

  const existing = await categoryRepo.getById(id);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await categoryRepo.deleteCategory(id);

  return new NextResponse(null, { status: 204 });
}

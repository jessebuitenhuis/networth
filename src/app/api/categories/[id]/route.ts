import { NextResponse } from "next/server";

import {
  deleteCategory,
  getCategoryById,
  updateCategory,
} from "@/categories/categoryRepository";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await getCategoryById(id);

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await updateCategory(id, {
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

  const existing = await getCategoryById(id);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await deleteCategory(id);

  return new NextResponse(null, { status: 204 });
}

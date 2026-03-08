import { NextResponse } from "next/server";

import {
  createCategory,
  getAllCategories,
} from "@/categories/categoryRepository";

export async function GET() {
  const rows = await getAllCategories();
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.id || !body.name) {
      return NextResponse.json(
        { error: "Missing required fields: id, name" },
        { status: 400 },
      );
    }

    const created = await createCategory({
      id: body.id,
      name: body.name,
      parentCategoryId: body.parentCategoryId,
    });

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

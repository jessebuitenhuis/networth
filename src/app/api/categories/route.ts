import { NextResponse } from "next/server";

import { getCurrentUserId } from "@/auth/getCurrentUserId";
import {
  createCategory,
  getAllCategories,
} from "@/categories/categoryRepository";

export async function GET() {
  const userId = await getCurrentUserId();
  const rows = getAllCategories(userId);
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    const body = await request.json();

    if (!body.id || !body.name) {
      return NextResponse.json(
        { error: "Missing required fields: id, name" },
        { status: 400 },
      );
    }

    const created = createCategory(userId, {
      id: body.id,
      name: body.name,
      parentCategoryId: body.parentCategoryId,
    });

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

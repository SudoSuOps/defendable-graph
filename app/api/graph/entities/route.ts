import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const entity = await prisma.entity.create({
    data: {
      id: body.id,
      type: body.type,
      name: body.name,
      status: body.status ?? "active",
      description: body.description ?? "",
      metadata: JSON.stringify(body.metadata ?? {}),
    },
  });
  return NextResponse.json(entity, { status: 201 });
}

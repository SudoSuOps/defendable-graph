import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const relationship = await prisma.relationship.create({
    data: {
      id: body.id,
      sourceId: body.sourceId,
      targetId: body.targetId,
      type: body.type,
      metadata: JSON.stringify(body.metadata ?? {}),
    },
  });
  return NextResponse.json(relationship, { status: 201 });
}

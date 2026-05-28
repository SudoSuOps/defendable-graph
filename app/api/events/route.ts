import { NextResponse } from "next/server";
import { getEvents } from "@/lib/graph";
import { prisma } from "@/lib/prisma";

export async function GET() {
  return NextResponse.json(await getEvents());
}

export async function POST(request: Request) {
  const body = await request.json();
  const event = await prisma.graphEvent.create({
    data: {
      id: body.id ?? `evt_${Date.now()}`,
      eventType: body.eventType,
      actorId: body.actorId,
      subjectId: body.subjectId,
      receiptHash: body.receiptHash,
      status: body.status ?? "running",
      metadata: JSON.stringify(body.metadata ?? {}),
    },
  });
  return NextResponse.json(event, { status: 201 });
}

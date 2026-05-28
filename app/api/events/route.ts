import { NextResponse } from "next/server";
import { getEvents } from "@/lib/graph";

export const runtime = "edge";

export async function GET() {
  return NextResponse.json(await getEvents());
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ id: body.id ?? `evt_${Date.now()}`, ...body, status: body.status ?? "running", metadata: body.metadata ?? {}, createdAt: new Date().toISOString(), persisted: false }, { status: 201 });
}

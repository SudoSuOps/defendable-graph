import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ ...body, metadata: body.metadata ?? {}, createdAt: new Date().toISOString(), persisted: false }, { status: 201 });
}

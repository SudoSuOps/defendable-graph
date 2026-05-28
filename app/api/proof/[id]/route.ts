import { NextResponse } from "next/server";
import { getProofTrace } from "@/lib/graph";

export const runtime = "edge";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json(await getProofTrace(id));
}

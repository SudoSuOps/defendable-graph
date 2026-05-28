import { NextResponse } from "next/server";
import { getGraphData } from "@/lib/graph";

export const runtime = "edge";

export async function GET() {
  return NextResponse.json(await getGraphData());
}

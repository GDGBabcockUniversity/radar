import { NextRequest, NextResponse } from "next/server";
import { searchAll } from "@/app/lib/sanity";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  try {
    const data = await searchAll(q);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Search API error:", err);
    return NextResponse.json(
      { results: [], authors: [], error: "Search request failed" },
      { status: 500 },
    );
  }
}

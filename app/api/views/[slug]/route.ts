import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/app/lib/redis";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

// GET /api/views/[slug] — fetch current view count
export async function GET(_req: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const views = (await redis.get<number>(`views:${slug}`)) ?? 0;

  return NextResponse.json({ views });
}

// POST /api/views/[slug] — increment view count
export async function POST(_req: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const views = await redis.incr(`views:${slug}`);

  return NextResponse.json({ views });
}

import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/app/lib/redis";
import { getMember } from "@/app/lib/member";
import { publicDisplayName } from "@/app/lib/displayName";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export interface Signal {
  id: string;
  memberId: string;
  name: string;
  body: string;
  createdAt: string;
  replyCount: number;
}

function signalsKey(slug: string) {
  return `radar:signals:${slug}`;
}

function signalHashKey(signalId: string) {
  return `radar:signal:${signalId}`;
}

function signalCountKey(slug: string) {
  return `radar:signals:count:${slug}`;
}

// GET /api/signals/[slug] — fetch all signals for a post
export async function GET(_req: NextRequest, context: RouteContext) {
  const { slug } = await context.params;

  // Get signal IDs ordered newest-first
  const signalIds = await redis.zrange(signalsKey(slug), 0, -1, { rev: true });

  if (!signalIds || signalIds.length === 0) {
    return NextResponse.json({ signals: [], count: 0 });
  }

  // Fetch all signal data in one pipeline
  const pipeline = redis.pipeline();
  for (const id of signalIds) {
    pipeline.hgetall(signalHashKey(id as string));
  }
  const results = await pipeline.exec();

  const signals: Signal[] = results
    .filter((r): r is Record<string, string> => r !== null && typeof r === "object")
    .map((data) => ({
      id: data.id,
      memberId: data.memberId,
      name: data.name,
      body: data.body,
      createdAt: data.createdAt,
      replyCount: parseInt(data.replyCount ?? "0", 10),
    }));

  return NextResponse.json({ signals, count: signals.length });
}

// POST /api/signals/[slug] — create a new signal (authenticated only)
export async function POST(req: NextRequest, context: RouteContext) {
  const member = await getMember();
  if (!member) {
    return NextResponse.json({ error: "Sign in to leave a Signal" }, { status: 401 });
  }

  const { slug } = await context.params;

  let body: string;
  try {
    const json = await req.json();
    body = typeof json.body === "string" ? json.body.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body || body.length === 0) {
    return NextResponse.json({ error: "Signal cannot be empty" }, { status: 400 });
  }

  if (body.length > 500) {
    return NextResponse.json({ error: "Signal must be 500 characters or fewer" }, { status: 400 });
  }

  const signalId = crypto.randomUUID();
  const now = new Date().toISOString();
  const displayName = publicDisplayName(member.name ?? null, member.memberId);

  const signal: Signal = {
    id: signalId,
    memberId: member.memberId,
    name: displayName,
    body,
    createdAt: now,
    replyCount: 0,
  };

  // Store signal hash + add to sorted set + increment count
  const pipeline = redis.pipeline();
  pipeline.hset(signalHashKey(signalId), { ...signal });
  pipeline.zadd(signalsKey(slug), { score: Date.now(), member: signalId });
  pipeline.incr(signalCountKey(slug));
  await pipeline.exec();

  return NextResponse.json({ signal }, { status: 201 });
}

// DELETE /api/signals/[slug]?signalId=xxx — delete own signal
export async function DELETE(req: NextRequest, context: RouteContext) {
  const member = await getMember();
  if (!member) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;
  const signalId = req.nextUrl.searchParams.get("signalId");

  if (!signalId) {
    return NextResponse.json({ error: "Missing signalId" }, { status: 400 });
  }

  // Verify ownership
  const signalData = await redis.hgetall(signalHashKey(signalId));
  if (!signalData || (signalData as Record<string, string>).memberId !== member.memberId) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  // Remove from sorted set, delete hash, decrement count
  const pipeline = redis.pipeline();
  pipeline.zrem(signalsKey(slug), signalId);
  pipeline.del(signalHashKey(signalId));
  pipeline.decr(signalCountKey(slug));
  await pipeline.exec();

  return NextResponse.json({ success: true });
}

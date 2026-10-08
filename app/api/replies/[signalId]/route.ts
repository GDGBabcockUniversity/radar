import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/app/lib/redis";
import { getMember } from "@/app/lib/member";
import { publicDisplayName } from "@/app/lib/displayName";

interface RouteContext {
  params: Promise<{ signalId: string }>;
}

export interface Reply {
  id: string;
  parentId: string;
  memberId: string;
  name: string;
  body: string;
  createdAt: string;
}

function repliesKey(signalId: string) {
  return `radar:replies:${signalId}`;
}

function replyHashKey(replyId: string) {
  return `radar:reply:${replyId}`;
}

function signalHashKey(signalId: string) {
  return `radar:signal:${signalId}`;
}

// GET /api/replies/[signalId] — fetch all replies oldest-first
export async function GET(_req: NextRequest, context: RouteContext) {
  const { signalId } = await context.params;

  const replyIds = await redis.zrange(repliesKey(signalId), 0, -1);

  if (!replyIds || replyIds.length === 0) {
    return NextResponse.json({ replies: [] });
  }

  const pipeline = redis.pipeline();
  for (const id of replyIds) {
    pipeline.hgetall(replyHashKey(id as string));
  }
  const results = await pipeline.exec();

  const replies: Reply[] = results
    .filter(
      (r): r is Record<string, string> => r !== null && typeof r === "object"
    )
    .map((data) => ({
      id: data.id,
      parentId: data.parentId,
      memberId: data.memberId,
      name: data.name,
      body: data.body,
      createdAt: data.createdAt,
    }));

  return NextResponse.json({ replies });
}

// POST /api/replies/[signalId] — create a reply (auth required)
export async function POST(req: NextRequest, context: RouteContext) {
  const member = await getMember();
  if (!member) {
    return NextResponse.json(
      { error: "Sign in to reply" },
      { status: 401 }
    );
  }

  const { signalId } = await context.params;

  let body: string;
  try {
    const json = await req.json();
    body = typeof json.body === "string" ? json.body.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body || body.length === 0) {
    return NextResponse.json({ error: "Reply cannot be empty" }, { status: 400 });
  }

  if (body.length > 500) {
    return NextResponse.json(
      { error: "Reply must be 500 characters or fewer" },
      { status: 400 }
    );
  }

  // Make sure the parent signal actually exists
  const parentData = await redis.hgetall(signalHashKey(signalId));
  if (!parentData || Object.keys(parentData).length === 0) {
    return NextResponse.json({ error: "Signal not found" }, { status: 404 });
  }

  const replyId = crypto.randomUUID();
  const now = new Date().toISOString();
  const displayName = publicDisplayName(member.name ?? null, member.memberId);

  const reply: Reply = {
    id: replyId,
    parentId: signalId,
    memberId: member.memberId,
    name: displayName,
    body,
    createdAt: now,
  };

  const pipeline = redis.pipeline();
  // Store reply hash
  pipeline.hset(replyHashKey(replyId), { ...reply });
  // Add to parent's reply sorted set (oldest-first, score = timestamp)
  pipeline.zadd(repliesKey(signalId), { score: Date.now(), member: replyId });
  // Increment replyCount on the parent signal hash
  pipeline.hincrby(signalHashKey(signalId), "replyCount", 1);
  await pipeline.exec();

  return NextResponse.json({ reply }, { status: 201 });
}

// DELETE /api/replies/[signalId]?replyId=xxx — delete own reply
export async function DELETE(req: NextRequest, context: RouteContext) {
  const member = await getMember();
  if (!member) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { signalId } = await context.params;
  const replyId = req.nextUrl.searchParams.get("replyId");

  if (!replyId) {
    return NextResponse.json({ error: "Missing replyId" }, { status: 400 });
  }

  // Verify ownership
  const replyData = await redis.hgetall(replyHashKey(replyId));
  if (
    !replyData ||
    (replyData as Record<string, string>).memberId !== member.memberId
  ) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const pipeline = redis.pipeline();
  pipeline.zrem(repliesKey(signalId), replyId);
  pipeline.del(replyHashKey(replyId));
  // Decrement replyCount on the parent (floor at 0)
  pipeline.hincrby(signalHashKey(signalId), "replyCount", -1);
  await pipeline.exec();

  return NextResponse.json({ success: true });
}

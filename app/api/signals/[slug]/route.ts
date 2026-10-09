import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/app/lib/redis";
import { getMemberWithRefresh } from "@/app/lib/platform-session";
import { publicDisplayName } from "@/app/lib/displayName";
import {
  createSignal,
  deleteSignal,
  getSignal,
  getSignals,
} from "@/app/lib/comments";
import { cookies } from "next/headers";
import signalItem from "@/sanity/schemas/signalItem";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

// GET /api/signals/[slug] — fetch all signals for a post
export async function GET(_req: NextRequest, context: RouteContext) {
  const { slug } = await context.params;

  const results = (await getSignals(slug)) ?? [];

  const signals = results.map((data) => ({
    id: data.id,
    memberId: data.userId,
    body: data.content,
    createdAt: data.createdAt,
    replyCount: data.replyCount,
  }));

  return NextResponse.json({ signals, count: signals.length });
}

// POST /api/signals/[slug] — create a new signal (authenticated only)
export async function POST(req: NextRequest, context: RouteContext) {
  const member = await getMemberWithRefresh(await cookies());
  if (!member) {
    return NextResponse.json(
      { error: "Sign in to leave a Signal" },
      { status: 401 },
    );
  }

  const { slug } = await context.params;

  const body: { parentId: string; content: string } = await req.json();

  if (body.content.length === 0) {
    return NextResponse.json(
      { error: "Signal cannot be empty" },
      { status: 400 },
    );
  }

  if (body.content.length > 500) {
    return NextResponse.json(
      { error: "Signal must be 500 characters or fewer" },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const displayName = publicDisplayName(member.name ?? null, member.memberId);

  await createSignal({
    memberId: member.memberId,
    parentId: body.parentId,
    slug,
    content: body.content,
  });

  return NextResponse.json({ signal }, { status: 201 });
}

// DELETE /api/signals/[slug]?signalId=xxx — delete own signal
export async function DELETE(req: NextRequest, context: RouteContext) {
  const member = await getMemberWithRefresh(await cookies());
  if (!member) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;
  const signalId = req.nextUrl.searchParams.get("signalId");

  if (!signalId) {
    return NextResponse.json({ error: "Missing signalId" }, { status: 400 });
  }

  // Verify ownership
  const signal = await getSignal(signalId);

  if (!signal || signal.userId !== member.memberId) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  await deleteSignal(signalId);

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { getMemberWithRefresh } from "@/app/lib/platform-session";
import { publicDisplayName } from "@/app/lib/displayName";
import type { Signal } from "@/app/lib/signal-types";
import {
  createSignal,
  deleteSignal,
  getSignal,
  getPublicSignals,
} from "@/app/lib/signal";
import { cookies } from "next/headers";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

// GET /api/signals/[slug] — fetch all signals for a post
export async function GET(_req: NextRequest, context: RouteContext) {
  const { slug } = await context.params;

  const signals = await getPublicSignals(slug);

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

  const body = await req.json().catch(() => null);
  if (!body || typeof body.content !== "string") {
    return NextResponse.json(
      { error: "Signal content is required" },
      { status: 400 },
    );
  }
  const content = body.content.trim();

  if (content.length === 0) {
    return NextResponse.json(
      { error: "Signal cannot be empty" },
      { status: 400 },
    );
  }

  if (content.length > 500) {
    return NextResponse.json(
      { error: "Signal must be 500 characters or fewer" },
      { status: 400 },
    );
  }

  const created = await createSignal({
    memberId: member.memberId,
    parentId: null,
    slug,
    content,
  });
  if (!created) {
    return NextResponse.json(
      { error: "Signals are unavailable" },
      { status: 503 },
    );
  }

  const signal: Signal = {
    id: created.id,
    memberId: created.userId,
    name: publicDisplayName(member.name ?? null, member.memberId),
    body: created.content,
    createdAt: created.createdAt.toISOString(),
    replyCount: 0,
  };

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

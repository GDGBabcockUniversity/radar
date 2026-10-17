import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRadarDB } from "@/app/lib/db/client";
import { getMemberWithRefresh } from "@/app/lib/platform-session";
import {
  createReply,
  deleteReply,
  getReplies,
  parseReplyBody,
  validCommentId,
} from "@/app/lib/reply";

interface RouteContext {
  params: Promise<{ signalId: string }>;
}
const reply = (status: number, body: object) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
const unavailable = () =>
  reply(503, { error: "Replies are temporarily unavailable" });

export async function GET(_req: NextRequest, context: RouteContext) {
  const { signalId } = await context.params;
  if (!validCommentId(signalId))
    return reply(400, { error: "Invalid signalId" });
  try {
    const db = getRadarDB();
    if (!db) return unavailable();
    const replies = await getReplies(db, signalId);
    return replies === null
      ? reply(404, { error: "Signal not found" })
      : reply(200, { replies });
  } catch {
    return unavailable();
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  if (req.headers.get("origin") !== req.nextUrl.origin)
    return reply(403, { error: "Not allowed" });
  const member = await getMemberWithRefresh(await cookies());
  if (!member) return reply(401, { error: "Sign in to reply" });
  const { signalId } = await context.params;
  if (!validCommentId(signalId))
    return reply(400, { error: "Invalid signalId" });
  let body: string | null;
  try {
    const raw = await req.text();
    if (raw.length > 4096)
      return reply(413, { error: "Request body too large" });
    body = parseReplyBody(JSON.parse(raw));
  } catch {
    return reply(400, { error: "Invalid request body" });
  }
  if (body === null)
    return reply(400, { error: "Reply must contain 1–500 characters" });
  try {
    const db = getRadarDB();
    if (!db) return unavailable();
    const created = await createReply(db, {
      signalId,
      memberId: member.memberId,
      name: member.name,
      body,
    });
    return created
      ? reply(201, { reply: created })
      : reply(404, { error: "Signal not found" });
  } catch {
    return unavailable();
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  if (req.headers.get("origin") !== req.nextUrl.origin)
    return reply(403, { error: "Not allowed" });
  const member = await getMemberWithRefresh(await cookies());
  if (!member) return reply(401, { error: "Unauthorized" });
  const { signalId } = await context.params;
  const replyId = req.nextUrl.searchParams.get("replyId");
  if (!validCommentId(signalId) || !replyId || !validCommentId(replyId))
    return reply(400, { error: "Invalid signalId or replyId" });
  try {
    const db = getRadarDB();
    if (!db) return unavailable();
    const deleted = await deleteReply(db, signalId, replyId, member.memberId);
    return deleted
      ? reply(200, { success: true })
      : reply(403, { error: "Not allowed" });
  } catch {
    return unavailable();
  }
}

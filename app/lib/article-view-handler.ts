import { NextRequest, NextResponse } from "next/server";
import {
  validArticleId,
  validVisitId,
  visitSigner,
  VISITOR_COOKIE,
} from "./article-visit";
const DAY = 86400;
interface Dependencies {
  secret(): string;
  rateLimit(key: string, maximum: number): Promise<boolean>;
  articleExists(id: string): Promise<boolean>;
  record(
    key: string,
    id: string,
    event: "open" | "engaged" | "completion",
  ): Promise<unknown>;
}
const reply = (status: number, body?: object) =>
  new NextResponse(body ? JSON.stringify(body) : null, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(status === 429 || status === 503 ? { "Retry-After": "60" } : {}),
    },
  });

export function createArticleViewHandler(deps: Dependencies) {
  return async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> },
  ) {
    const { id } = await context.params;
    if (!validArticleId(id)) return reply(400, { error: "Invalid article" });
    if (
      req.headers.get("origin") !== req.nextUrl.origin ||
      req.headers.get("sec-fetch-site") === "cross-site"
    )
      return reply(403);
    const ua = req.headers.get("user-agent") ?? "";
    if (!ua || /bot|crawler|spider|headless|preview/i.test(ua))
      return reply(204);
    let body: Record<string, unknown>;
    try {
      // Bound the streamed body, including requests without Content-Length.
      const reader = req.body?.getReader();
      if (!reader) return reply(400);
      let size = 0;
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 4096) {
          await reader.cancel();
          return reply(413);
        }
        chunks.push(value);
      }
      body = JSON.parse(Buffer.concat(chunks).toString());
      if (!body || typeof body !== "object" || Array.isArray(body))
        return reply(400);
    } catch {
      return reply(400);
    }
    const event = body.event;
    if (event !== "open" && event !== "engaged" && event !== "completion")
      return reply(400);
    if (event === "open" && !validVisitId(body.visitId)) return reply(400);
    try {
      const signer = visitSigner(deps.secret());
      const visitor = signer.visitor(req.cookies.get(VISITOR_COOKIE)?.value);
      const proof =
        event === "open" ? null : signer.validate(body.token, visitor.id, id);
      if (event !== "open") {
        if (
          !proof ||
          typeof body.depth !== "number" ||
          !Number.isFinite(body.depth) ||
          body.depth > 1 ||
          body.depth < (event === "engaged" ? 0.25 : 0.9) ||
          typeof body.activeMs !== "number" ||
          !Number.isFinite(body.activeMs) ||
          body.activeMs < 0 ||
          body.activeMs > Date.now() - proof.started + 1000
        )
          return reply(400);
        if (
          event === "engaged" &&
          (body.activeMs < 10_000 || Date.now() - proof.started < 10_000)
        )
          return reply(400);
      }
      // Atomic fixed-window limiter; no INCR/EXPIRE gap on process failure.
      // The global ceiling also bounds cookie churn without retaining IPs.
      const bucket = Math.floor(Date.now() / 60_000);
      if (
        !(await deps.rateLimit(`radar:view-rate:global:${bucket}`, 3000)) ||
        !(await deps.rateLimit(
          `radar:view-rate:${signer.hash(visitor.id)}:${bucket}`,
          60,
        ))
      )
        return reply(429);
      if (!(await deps.articleExists(id))) return reply(404);
      const identity =
        event === "open" ? `${visitor.id}:${body.visitId}` : visitor.id;
      const key = signer.hash(JSON.stringify([id, identity, event]));
      await deps.record(key, id, event);
      if (event !== "open") return reply(204);
      const response = reply(200, {
        token: signer.issue(visitor.id, id, body.visitId as string),
      });
      response.cookies.set(VISITOR_COOKIE, visitor.cookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 365 * DAY,
      });
      return response;
    } catch {
      console.error("Article view recording unavailable");
      return reply(503, { error: "Views temporarily unavailable" });
    }
  };
}

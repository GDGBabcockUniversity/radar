import "server-only";
import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import type { NextRequest } from "next/server";
import { getRadarDB } from "./db/client";
import { radarAnonymousViews } from "./db/schema";
import { redis } from "./redis";

export async function recordAnonymousView(req: NextRequest, slug: string) {
  const secret = process.env.VIEW_FINGERPRINT_SECRET;
  if (!secret || secret.length < 32)
    throw new Error(
      "VIEW_FINGERPRINT_SECRET must contain at least 32 characters",
    );
  // Vercel overwrites this header. Other deployments must explicitly configure
  // a header their reverse proxy overwrites, never an arbitrary visitor header.
  const header =
    process.env.VIEW_IP_HEADER ||
    (process.env.VERCEL
      ? "x-vercel-forwarded-for"
      : process.env.NODE_ENV === "development" ? "x-forwarded-for" : undefined);
  const ip = header ? req.headers.get(header)?.split(",")[0].trim() : undefined;
  if (!ip || !isIP(ip))
    throw new Error(
      "Trusted client IP is unavailable; configure VIEW_IP_HEADER",
    );
  const userAgent = (req.headers.get("user-agent") || "unknown").slice(0, 1024);
  if (/bot|crawler|spider|headless|preview/i.test(userAgent)) return;
  const day = new Date().toISOString().slice(0, 10);
  const fingerprint = createHmac("sha256", secret)
    .update(JSON.stringify([ip, userAgent, slug, day]))
    .digest("hex");
  const db = getRadarDB();
  if (!db) throw new Error("RADAR database is unavailable");
  const inserted = await db
    .insert(radarAnonymousViews)
    .values({ fingerprint, slug })
    .onConflictDoNothing({ target: radarAnonymousViews.fingerprint })
    .returning({ fingerprint: radarAnonymousViews.fingerprint });
  if (inserted.length)
    await redis.del(`radar:views:v4:${slug}`).catch(() => {});
}

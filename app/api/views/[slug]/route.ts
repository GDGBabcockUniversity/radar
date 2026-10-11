import { NextRequest, NextResponse } from "next/server";
import { count, eq } from "drizzle-orm";
import { getRadarDB } from "@/app/lib/db/client";
import {
  radarAnonymousViews,
  radarPostViewBaselines,
  radarReadSessions,
} from "@/app/lib/db/schema";
import { redis } from "@/app/lib/redis";

const CACHE_TTL_SECONDS = 300;

interface RouteContext {
  params: Promise<{ slug: string }>;
}

// GET /api/views/[slug] — fetch cached count of recorded article read sessions
export async function GET(_req: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const key = `radar:views:v4:${slug}`;
  try {
    const cachedViews = await redis.get<number>(key);
    if (cachedViews !== null) {
      return NextResponse.json({ views: cachedViews });
    }
  } catch {
    // Redis is an optional cache; the database remains the source of truth.
  }

  const db = getRadarDB();
  if (!db) {
    return NextResponse.json(
      { error: "Views are unavailable" },
      { status: 503 },
    );
  }

  const [[readRecord], [baselineRecord], [anonymousRecord]] = await Promise.all(
    [
      db
        .select({ views: count() })
        .from(radarReadSessions)
        .where(eq(radarReadSessions.slug, slug)),
      db
        .select({ views: radarPostViewBaselines.views })
        .from(radarPostViewBaselines)
        .where(eq(radarPostViewBaselines.slug, slug))
        .limit(1),
      db
        .select({ views: count() })
        .from(radarAnonymousViews)
        .where(eq(radarAnonymousViews.slug, slug)),
    ],
  );
  const readSessionCount = Number(readRecord?.views ?? 0);
  let baseline = baselineRecord?.views;

  if (baseline === undefined) {
    let previousViews = 0;
    try {
      previousViews = (await redis.get<number>(`views:${slug}`)) ?? 0;
    } catch {
      // If the legacy key is unavailable, initialize from durable reads only.
    }

    const [createdBaseline] = await db
      .insert(radarPostViewBaselines)
      .values({
        slug,
        views: Math.max(0, previousViews - readSessionCount),
      })
      .onConflictDoNothing({ target: radarPostViewBaselines.slug })
      .returning({ views: radarPostViewBaselines.views });

    if (createdBaseline) {
      baseline = createdBaseline.views;
    } else {
      const [persistedBaseline] = await db
        .select({ views: radarPostViewBaselines.views })
        .from(radarPostViewBaselines)
        .where(eq(radarPostViewBaselines.slug, slug))
        .limit(1);
      baseline = persistedBaseline?.views ?? 0;
    }
  }

  const views =
    baseline + readSessionCount + Number(anonymousRecord?.views ?? 0);

  try {
    await redis.set(key, views, { ex: CACHE_TTL_SECONDS });
  } catch {
    // A cache write failure should not fail a view count read.
  }

  return NextResponse.json({ views });
}

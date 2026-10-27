import { lte, sql } from "drizzle-orm";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { z } from "zod";
import { getRadarDB } from "@/app/lib/db/client";
import { radarUsers } from "@/app/lib/db/schema";

const userEvent = z.object({
  type: z.literal("user.upsert"),
  user: z.object({
    id: z.uuid(),
    full_name: z.string().max(255),
    profile_picture: z.url().nullable(),
    updated_at: z.iso.datetime({ offset: true }),
  }),
});

async function handleUserEvent(request: Request) {
  const parsed = userEvent.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    console.error(parsed.error)
    return Response.json({ error: "Invalid user event" }, { status: 400 });
  }

  const db = getRadarDB();
  if (!db) {
    return Response.json(
      { error: "User directory unavailable" },
      { status: 503 },
    );
  }

  const { id, full_name, profile_picture, updated_at } = parsed.data.user;
  await db
    .insert(radarUsers)
    .values({
      id,
      fullName: full_name,
      sourceUpdatedAt: new Date(updated_at),
      profilePicture: profile_picture,
    })
    .onConflictDoUpdate({
      target: radarUsers.id,
      set: {
        fullName: sql`excluded.full_name`,
        profilePicture: sql`excluded.profile_picture`,
        sourceUpdatedAt: sql`excluded.source_updated_at`,
      },
      setWhere: lte(
        radarUsers.sourceUpdatedAt,
        sql`excluded.source_updated_at`,
      ),
    });

  return Response.json({ ok: true });
}

export async function POST(request: Request) {
  const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;
  if (!currentSigningKey || !nextSigningKey) {
    return Response.json({ error: "User events unavailable" }, { status: 503 });
  }
  return verifySignatureAppRouter(handleUserEvent, {
    currentSigningKey,
    nextSigningKey,
  })(request);
}

import { and, asc, eq, isNull } from "drizzle-orm";
import type { getRadarDB } from "./db/client";
import { comments, radarUsers } from "./db/schema";
import { publicDisplayName } from "./displayName";
import type { Reply } from "./signal-types";

type Database = NonNullable<ReturnType<typeof getRadarDB>>;
export const validCommentId = (id: string) =>
  /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id);
export function parseReplyBody(input: unknown) {
  if (
    !input ||
    typeof input !== "object" ||
    !("body" in input) ||
    typeof input.body !== "string"
  )
    return null;
  const body = input.body.trim();
  return body.length > 0 && body.length <= 500 ? body : null;
}

export async function getReplies(
  db: Database,
  signalId: string,
): Promise<Reply[] | null> {
  const [parent] = await db
    .select({ id: comments.id })
    .from(comments)
    .where(and(eq(comments.id, signalId), isNull(comments.parentId)));
  if (!parent) return null;
  const rows = await db
    .select({
      id: comments.id,
      parentId: comments.parentId,
      memberId: comments.userId,
      name: radarUsers.fullName,
      body: comments.content,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .leftJoin(radarUsers, eq(comments.userId, radarUsers.id))
    .where(eq(comments.parentId, signalId))
    .orderBy(asc(comments.createdAt), asc(comments.id));
  return rows.map((row) => ({
    ...row,
    parentId: signalId,
    name: publicDisplayName(row.name, row.memberId),
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function createReply(
  db: Database,
  input: { signalId: string; memberId: string; name?: string; body: string },
): Promise<Reply | null> {
  return db.transaction(async (tx) => {
    const [parent] = await tx
      .select({ slug: comments.articleSlug })
      .from(comments)
      .where(and(eq(comments.id, input.signalId), isNull(comments.parentId)))
      .for("key share");
    if (!parent) return null;
    const [created] = await tx
      .insert(comments)
      .values({
        parentId: input.signalId,
        articleSlug: parent.slug,
        userId: input.memberId,
        content: input.body,
      })
      .returning();
    return {
      id: created.id,
      parentId: input.signalId,
      memberId: created.userId,
      name: publicDisplayName(input.name ?? null, input.memberId),
      body: created.content,
      createdAt: created.createdAt.toISOString(),
    };
  });
}

export async function deleteReply(
  db: Database,
  signalId: string,
  replyId: string,
  memberId: string,
) {
  const deleted = await db
    .delete(comments)
    .where(
      and(
        eq(comments.id, replyId),
        eq(comments.parentId, signalId),
        eq(comments.userId, memberId),
      ),
    )
    .returning({ id: comments.id });
  return deleted.length > 0;
}

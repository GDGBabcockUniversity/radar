import { eq, sql } from "drizzle-orm";
import { getRadarDB } from "./db/client";
import { comments, radarUsers } from "./db/schema";

export interface Signal {
  id: string;
  memberId: string;
  slug: string;
  content: string;
  createdAt: string;
  parentId: string;
}

export const getSignals = async (articleSlug: string) => {
  try {
    const db = getRadarDB();

    if (!db) return;

    const signals = await db
      .select({
        id: comments.id,
        userId: comments.userId,
        content: comments.content,
        createdAt: comments.createdAt,
        name: radarUsers.fullName,
        replyCount: sql<number>`(
              SELECT COUNT(*)::int
              FROM comments as replies
              WHERE replies.parent_id = ${comments.id}
            )`,
      })
      .from(comments)
      .leftJoin(radarUsers, eq(comments.userId, radarUsers.id))
      .where(eq(comments.articleSlug, articleSlug));

    return signals;
  } catch (error) {
    console.log("error creating comment", error);
  }
};

export const getSignal = async (signalId: string) => {
  try {
    const db = getRadarDB();

    if (!db) return;

    const signals = await db.query.comments.findFirst({
      where: (comments, { eq }) => eq(comments.id, signalId),
    });

    return signals;
  } catch (error) {
    console.log("error creating comment", error);
  }
};

export const createSignal = async (
  signal: Omit<Signal, "id" | "createdAt" | "parentId"> & {
    parentId: string | null;
  },
) => {
  try {
    const db = getRadarDB();

    if (!db) return;

    const [created] = await db
      .insert(comments)
      .values({
        content: signal.content,
        userId: signal.memberId,
        parentId: signal.parentId,
        articleSlug: signal.slug,
      })
      .returning();
    return created;
  } catch (error) {
    console.log("error creating comment", error);
  }
};

export const deleteSignal = async (signalId: string) => {
  try {
    const db = getRadarDB();

    if (!db) return;

    await db.delete(comments).where(eq(comments.id, signalId));
  } catch (error) {
    console.log("error creating comment", error);
  }
};

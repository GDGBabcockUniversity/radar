import { eq, sql } from "drizzle-orm";
import { getRadarDB } from "./db/client";
import { comments } from "./db/schema";

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

    const signals = await db.query.comments.findMany({
      where: (comments, { eq }) => eq(comments.articleSlug, articleSlug),
      extras: (table) => ({
        replyCount: sql<number>`(
              SELECT COUNT(*)::int
              FROM comments as replies
              WHERE replies.parent_id = ${table.id}
            )`.as("replyCount"),
      }),
    });

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
  signal: Omit<Signal, "id" | "createdAt">,
) => {
  try {
    const db = getRadarDB();

    if (!db) return;

    await db.insert(comments).values({
      content: signal.content,
      userId: signal.memberId,
      parentId: signal.parentId,
      articleSlug: signal.slug,
    });
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

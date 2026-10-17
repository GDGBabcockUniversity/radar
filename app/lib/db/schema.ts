import { relations } from "drizzle-orm";
import {
  AnyPgColumn,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const radarGameScores = pgTable(
  "game_scores",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    game: varchar("game", { length: 100 }).notNull(),
    puzzleId: varchar("puzzle_id", { length: 255 }),
    score: integer("score").notNull(),
    meta: jsonb("meta"),
    playedAt: timestamp("played_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("radar_game_scores_user_idx").on(table.userId),
    index("radar_game_scores_game_idx").on(table.game),
  ],
);

export const radarReads = pgTable(
  "reads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    slug: varchar("slug", { length: 500 }).notNull(),
    seconds: integer("seconds").default(0).notNull(),
    readCount: integer("read_count").default(1).notNull(),
    firstReadAt: timestamp("first_read_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    readAt: timestamp("read_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("radar_reads_user_slug_key").on(table.userId, table.slug),
    index("radar_reads_user_idx").on(table.userId),
  ],
);

export const radarPostViewBaselines = pgTable("post_view_baselines", {
  slug: varchar("slug", { length: 500 }).primaryKey(),
  views: integer("views").default(0).notNull(),
});

// Anonymous views are deduplicated by a keyed IP/UA/article/day fingerprint.
export const radarAnonymousViews = pgTable(
  "anonymous_views",
  {
    fingerprint: varchar("fingerprint", { length: 64 }).primaryKey(),
    slug: varchar("slug", { length: 500 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("radar_anonymous_views_slug_idx").on(table.slug)],
);

// Public identity fields mirrored from auth-v2 for joins inside RADAR's DB.
export const radarUsers = pgTable("radar_users", {
  id: uuid("id").primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  profilePicture: text("profile_picture"),
  sourceUpdatedAt: timestamp("source_updated_at", { withTimezone: true }).notNull(),
});

export const radarReadSessions = pgTable(
  "read_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    sessionId: varchar("session_id", { length: 64 }).notNull(),
    slug: varchar("slug", { length: 500 }).notNull(),
    seconds: integer("seconds").default(0).notNull(),
    maxScroll: integer("max_scroll").default(0).notNull(),
    startedAt: timestamp("started_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("radar_read_sessions_identity_key").on(
      table.userId,
      table.sessionId,
      table.slug,
    ),
  ],
);

export const radarArticleAuthors = pgTable(
  "article_authors",
  {
    slug: varchar("slug", { length: 500 }).notNull(),
    authorName: varchar("author_name", { length: 255 }).notNull(),
    authorUserId: uuid("author_user_id"),
    title: varchar("title", { length: 500 }),
    kind: varchar("kind", { length: 50 }).default("article").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    syncedAt: timestamp("synced_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("radar_article_authors_key").on(table.slug, table.authorName),
    index("radar_article_authors_user_idx").on(table.authorUserId),
  ],
);

export const radarActivityDays = pgTable(
  "activity_days",
  {
    userId: uuid("user_id").notNull(),
    day: varchar("day", { length: 10 }).notNull(),
    plays: integer("plays").default(0).notNull(),
    reads: integer("reads").default(0).notNull(),
    seconds: integer("seconds").default(0).notNull(),
  },
  (table) => [
    uniqueIndex("radar_activity_days_user_day_key").on(table.userId, table.day),
    index("radar_activity_days_day_idx").on(table.day),
  ],
);

export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: varchar({ length: 500 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  userId: uuid("user_id").notNull(),
  articleSlug: varchar("article_slug").notNull(),
  parentId: uuid("parent_id").references((): AnyPgColumn => comments.id, {
    onDelete: "cascade"
  })
});


export const commentRelation = relations(comments, ({ one, many }) => ({
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "comment_replies"
  }),
  replies: many(comments, {
     relationName: "comment_replies"
   }),
}));

// Public views include this immutable historical baseline plus new engaged views.
export const radarArticleMetrics = pgTable("article_metrics", {
  articleId: varchar("article_id", { length: 128 }).primaryKey(),
  historicalViews: integer("historical_views"),
  pageViews: integer("page_views").default(0).notNull(),
  engagedViews: integer("engaged_views").default(0).notNull(),
  readCompletions: integer("read_completions").default(0).notNull(),
});

// One opaque key per visitor/article/metric; updates enforce a rolling window.
export const radarViewReceipts = pgTable("view_receipts", {
  key: varchar("key", { length: 64 }).primaryKey(),
  countedAt: timestamp("counted_at", { withTimezone: true }).defaultNow().notNull(),
});

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export const VISITOR_COOKIE = "radar_visitor";
export const validArticleId = (id: string) =>
  /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,127}$/.test(id) && !id.startsWith("drafts.");
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const validVisitId = (id: unknown): id is string =>
  typeof id === "string" && uuid.test(id);

export function visitSigner(secret: string) {
  if (secret.length < 32)
    throw new Error("ARTICLE_VIEW_SECRET must contain at least 32 characters");
  const hash = (value: string) =>
    createHmac("sha256", secret).update(value).digest("hex");
  const sign = (value: string) => `${value}.${hash(value)}`;
  const verify = (signed: string) => {
    const index = signed.lastIndexOf(".");
    const value = signed.slice(0, index);
    const signature = signed.slice(index + 1);
    const expected = hash(value);
    return /^[a-f0-9]{64}$/.test(signature) &&
      timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
      ? value
      : null;
  };
  return {
    hash,
    visitor(cookie?: string) {
      const existing = cookie && cookie.length < 200 ? verify(cookie) : null;
      const id = existing && uuid.test(existing) ? existing : randomUUID();
      return { id, cookie: sign(id) };
    },
    issue(visitor: string, article: string, visitId: string, now = Date.now()) {
      return sign(
        Buffer.from(
          JSON.stringify({
            visitor: hash(visitor),
            article,
            visitId,
            started: now,
          }),
        ).toString("base64url"),
      );
    },
    validate(
      token: unknown,
      visitor: string,
      article: string,
      now = Date.now(),
    ) {
      if (typeof token !== "string" || token.length > 1024) return null;
      const value = verify(token);
      if (!value) return null;
      try {
        const data = JSON.parse(Buffer.from(value, "base64url").toString());
        return data.visitor === hash(visitor) &&
          data.article === article &&
          validVisitId(data.visitId) &&
          Number.isFinite(data.started) &&
          data.started <= now &&
          now - data.started <= 24 * 60 * 60 * 1000
          ? (data as { started: number; visitId: string })
          : null;
      } catch {
        return null;
      }
    },
  };
}

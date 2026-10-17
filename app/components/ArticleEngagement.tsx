"use client";

import { useRef, type ReactNode } from "react";
import { useArticleEngagement } from "@/app/hooks/useArticleEngagement";

export default function ArticleEngagement({
  articleId,
  children,
}: {
  articleId: string;
  children: ReactNode;
}) {
  const content = useRef<HTMLDivElement>(null);
  useArticleEngagement(articleId, content);
  return <div ref={content}>{children}</div>;
}

import React from "react";
import { useFormValue, useClient } from "sanity";

interface PreviewUrlFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schemaType?: any;
}

// Map document type -> route segment so the preview link matches the page.
const TYPE_PATHS: Record<string, string> = {
  post: "posts",
  issue: "issues",
  article: "articles",
  series: "series",
};

const BASE = "https://radar.gdgbabcock.com";

export function PreviewUrlField(props: PreviewUrlFieldProps) {
  const slug = useFormValue(["slug", "current"]) as string | undefined;
  const type = useFormValue(["_type"]) as string | undefined;
  // Episodes are nested under their series: /series/<series>/<episode>.
  const seriesRef = useFormValue(["series", "_ref"]) as string | undefined;
  const client = useClient({ apiVersion: "2024-01-01" });
  const [seriesSlug, setSeriesSlug] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (type !== "episode" || !seriesRef) return;
    let active = true;
    client
      .fetch<string | undefined>(`*[_id == $id][0].slug.current`, {
        id: seriesRef,
      })
      .then((s) => active && setSeriesSlug(s))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [client, type, seriesRef]);

  let url = "";
  if (slug) {
    if (type === "episode") {
      url = seriesSlug ? `${BASE}/series/${seriesSlug}/${slug}` : "";
    } else {
      const segment = (type && TYPE_PATHS[type]) || "posts";
      url = `${BASE}/${segment}/${slug}`;
    }
  }

  const handleCopy = async () => {
    if (!url) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // Swallow copy errors – preview URL is non-critical
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <div style={{ fontWeight: 500 }}>
        {props.schemaType?.title ?? "Preview URL"}
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          readOnly
          value={url}
          placeholder="Set a slug to see the preview URL"
          style={{ flex: 1, padding: "0.35rem 0.5rem" }}
        />
        <button
          type="button"
          onClick={handleCopy}
          disabled={!url}
          style={{
            padding: "0.35rem 0.75rem",
            cursor: url ? "pointer" : "not-allowed",
          }}
        >
          Copy
        </button>
      </div>
      {props.schemaType?.description && (
        <p
          style={{
            margin: 0,
            fontSize: "0.8rem",
            opacity: 0.75,
          }}
        >
          {props.schemaType.description}
        </p>
      )}
    </div>
  );
}


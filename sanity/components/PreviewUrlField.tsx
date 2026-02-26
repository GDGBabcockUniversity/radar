import React from "react";
import { useFormValue } from "sanity";

interface PreviewUrlFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schemaType?: any;
}

export function PreviewUrlField(props: PreviewUrlFieldProps) {
  const slug = useFormValue(["slug", "current"]) as string | undefined;
  const url = slug ? `https://radar.gdgbabcock.com/posts/${slug}` : "";

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


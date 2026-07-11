import { ImageResponse } from "next/og";
import { getGame } from "../../lib/games";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "RADAR Games";

// Edge-runtime constraint: no external fetches, no custom fonts — system
// defaults only.
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = getGame(id);
  const title = game?.title ?? "RADAR Games";
  const blurb = game?.blurb ?? "One puzzle a day. Same for everyone.";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          padding: 80,
        }}
      >
        <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
          {["#4285f4", "#ea4335", "#f9ab00", "#34a853"].map((color) => (
            <div
              key={color}
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: color,
              }}
            />
          ))}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 88,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: -2,
            textAlign: "center",
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 30,
            color: "#9ca3af",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          {blurb}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 48,
            fontSize: 24,
            color: "#6b7280",
          }}
        >
          RADAR Games — radar.gdgbabcock.com
        </div>
      </div>
    ),
    { ...size }
  );
}

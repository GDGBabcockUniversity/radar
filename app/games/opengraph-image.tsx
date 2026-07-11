import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "RADAR Games";

// Edge-runtime constraint: no external fetches, no custom fonts — system
// defaults only.
export default function Image() {
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
            fontSize: 96,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: -2,
          }}
        >
          RADAR Games
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 32,
            color: "#9ca3af",
            textAlign: "center",
          }}
        >
          One puzzle a day. Same for everyone.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 48,
            fontSize: 24,
            color: "#6b7280",
          }}
        >
          radar.gdgbabcock.com/games
        </div>
      </div>
    ),
    { ...size }
  );
}

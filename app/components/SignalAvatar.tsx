"use client";

import { avatarColor } from "../lib/displayName";

interface SignalAvatarProps {
  name: string;
  memberId: string;
  size?: number;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function SignalAvatar({
  name,
  memberId,
  size = 36,
}: SignalAvatarProps) {
  const color = avatarColor(memberId);
  const initials = getInitials(name);

  return (
    <div
      className="signal-avatar"
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: "50%",
        backgroundColor: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 600,
        fontSize: size * 0.38,
        lineHeight: 1,
        userSelect: "none",
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}

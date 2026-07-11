// Public-board name formatting. Dependency-free on purpose so it stays a
// pure function (testable in isolation, importable anywhere without pulling
// the Redis client into scope).

/**
 * Full first name + last initial ("Ada L."), so leaderboards read as people
 * without publishing full names on a public page. Single-word names pass
 * through; missing names fall back to a stable pseudo-handle derived from
 * the member id.
 */
export function publicDisplayName(name: string | null, memberId: string): string {
  const trimmed = name?.trim();
  if (!trimmed) return `Member ${memberId.replace(/-/g, "").slice(0, 4)}`;
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

// GDG's four brand hues, deterministically assigned per member — the same
// member gets the same color everywhere a leaderboard row renders them.
const AVATAR_COLORS = ["#4285f4", "#ea4335", "#f9ab00", "#34a853"];

export function avatarColor(memberId: string): string {
  const code = memberId.charCodeAt(0) || 0;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

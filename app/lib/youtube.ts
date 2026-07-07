// Extract the 11-char YouTube video ID from any common URL shape.
export function getYouTubeId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/,
  );
  return match ? match[1] : null;
}

// Standard high-res thumbnail for a video (used as a card/OG image fallback).
export function youTubeThumbnail(url?: string): string | null {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
}

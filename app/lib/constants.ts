export const BASE_URL = "https://radar.gdgbabcock.com";

export const IMAGES = {
  logo: { src: "/logo.png", w: 390, h: 390 },
  radarLogo: { src: "/radar-logo.png", w: 430, h: 242 },
  radarSignalBg: { src: "/radar-signal-bg.png", w: 1780, h: 1780 },
};

export const CREDENTIALS = {
  sanity_project_id: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  sanity_dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,

  resend_api_key: process.env.RESEND_API_KEY!,

  qstash_url: process.env.QSTASH_URL!,
  qstash_token: process.env.QSTASH_TOKEN!,
  qstash_current_signing_key: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  qstash_next_signing_key: process.env.QSTASH_NEXT_SIGNING_KEY!,

  upstash_redis_rest_url: process.env.UPSTASH_REDIS_REST_URL!,
  upstash_redis_rest_token: process.env.UPSTASH_REDIS_REST_TOKEN!,

  // Shared GDG auth service (optional — engagement stays anonymous until set).
  auth_api_url: process.env.AUTH_API_URL,
  auth_jwt_secret: process.env.AUTH_JWT_SECRET,
  auth_cookie_name: process.env.AUTH_COOKIE_NAME || "gdg_token",
};

export const PAGES = {
  home: "/",
  team: "/team",
  contributors: "/contributors",
  series: "/series",
  about: "/about",
  issues: "/issues",
  games: "/games",
  search: "/search",
  post: (slug: string) => `/posts/${slug}`,
  issue: (slug: string) => `/issues/${slug}`,
  article: (slug: string) => `/articles/${slug}`,
  author: (slug: string) => `/team/${slug}`,
  seriesShow: (slug: string) => `/series/${slug}`,
  episode: (seriesSlug: string, slug: string) =>
    `/series/${seriesSlug}/${slug}`,
};

export const LINKS = {
  youtubePlaylist: "https://www.youtube.com/playlist?list=PLtUz78Yj1nzl2DRvEzS5raH_Jabh0fZ6S",
  contactEmail: "mailto:gdgbabcock@gmail.com",
  // Community clue submissions (Google Form). Empty until the owner sets
  // NEXT_PUBLIC_SUBMIT_CLUE_URL in Vercel — the link only renders when set.
  submitClue: process.env.NEXT_PUBLIC_SUBMIT_CLUE_URL || "",
};

// Cadence copy lives here so growing monthly -> bi-weekly -> weekly is a
// one-line edit, not a hunt through JSX.
export const CADENCE_TAGLINE =
  "Issues monthly. Series weekly. Signals continuously.";

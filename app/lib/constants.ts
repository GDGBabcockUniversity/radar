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
};

export const PAGES = {
  home: "/",
  team: "/team",
  series: "/series",
  about: "/about",
  issues: "/issues",
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
};

// Cadence copy lives here so growing monthly -> bi-weekly -> weekly is a
// one-line edit, not a hunt through JSX.
export const CADENCE_TAGLINE =
  "Issues monthly. Series weekly. Signals continuously.";

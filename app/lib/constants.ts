export const BASE_URL = "https://radar.gdgbabcock.com";

export const IMAGES = {
  logo: { src: "/logo.png", w: 390, h: 390 },
};

export const CREDENTIALS = {
  sanity_project_id: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  sanity_dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,

  resend_api_key: process.env.RESEND_API_KEY!,

  qstash_url: process.env.QSTASH_URL!,
  qstash_token: process.env.QSTASH_TOKEN!,
  qstash_current_signing_key: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  qstash_next_signing_key: process.env.QSTASH_NEXT_SIGNING_KEY!,
};

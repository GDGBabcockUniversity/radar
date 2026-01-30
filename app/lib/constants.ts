export const IMAGES = {
  logo: { src: "/logo.png", w: 390, h: 390 },
};

export const CREDENTIALS = {
  sanity_project_id: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  sanity_dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,

  resend_api_key: process.env.RESEND_API_KEY!,
};

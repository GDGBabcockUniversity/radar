[![Keyway Secrets](https://www.keyway.sh/badge.svg?repo=GDGBabcockUniversity/radar)](https://www.keyway.sh/vaults/GDGBabcockUniversity/radar)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# Distributed authentication and engagement

RADAR authenticates against `auth-v2` through `AUTH_API_URL`. It stores only the resulting access and refresh tokens as httpOnly RADAR cookies; it does not hold a Firebase configuration or the JWT signing key.

Set `RADAR_DATABASE_URL` to RADAR's PostgreSQL database. Drizzle owns `radar_game_scores`, `radar_reads`, and `radar_activity_days`; Redis remains the leaderboard projection. auth-v2 owns member identities, and RADAR stores their UUID as `user_id` without a cross-database foreign key.

After setting `RADAR_DATABASE_URL`, run `npm run db:migrate` before deploying the application.

To import the existing RADAR data from the legacy auth database, set `RADAR_SOURCE_DATABASE_URL` to that database and run `npm run db:migrate:auth-radar`. The command is idempotent and refuses to run if the source and target URLs are the same.

Required auth and storage environment variables:

- `AUTH_API_URL` — auth-v2 base URL, for native login, token refresh, and member lookup.
- `RADAR_DATABASE_URL` — RADAR's own PostgreSQL connection string, used only by Drizzle.
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` — leaderboard and fast aggregate projection storage.

For Google sign-in, configure auth-v2 with `GOOGLE_RETURN_URL` pointing to RADAR's `/api/auth/google/callback` URL. Keep `GOOGLE_REDIRECT_URL` pointed at auth-v2's `/auth/google/callback` endpoint.

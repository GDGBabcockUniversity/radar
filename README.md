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

RADAR authenticates against `auth-v2` through `AUTH_API_URL`. It stores only the resulting access and refresh tokens as httpOnly RADAR cookies; Firebase handles email/password registration, sign-in, and Google sign-in in the browser. RADAR exchanges the Firebase ID token at `/auth/login`; the JWT signing key stays in auth-v2.

Set `DATABASE_URL` to RADAR's PostgreSQL database. Drizzle owns RADAR's engagement tables; Redis remains the leaderboard projection. auth-v2 owns member identities, and RADAR stores their UUID as `user_id` without a cross-database foreign key.

After setting `DATABASE_URL`, run `npm run db:migrate` before deploying the application.

To import the existing RADAR data from the legacy auth database, set `RADAR_SOURCE_DATABASE_URL` to that database and run `npm run db:migrate:auth-radar`. The command is idempotent and refuses to run if the source and target URLs are the same.

Required auth and storage environment variables:

- `AUTH_API_URL` — auth-v2 base URL, for Firebase token exchange, token refresh, logout, and member lookup.
- `DATABASE_URL` — RADAR's own PostgreSQL connection string, used only by Drizzle.
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` — leaderboard and fast aggregate projection storage.

Configure `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, and `NEXT_PUBLIC_FIREBASE_APP_ID` using the Firebase web app configuration for the same project used by auth-v2. Enable Email/Password and Google providers and add RADAR's domain to Firebase Authentication's authorized domains. These public values must be available when building the frontend.

Firebase credentials use memory persistence and are cleared after the token exchange. RADAR keeps platform tokens in httpOnly cookies, refreshes sessions through `/auth/refresh`, and calls `/auth/logout` before clearing cookies. The former Google redirect routes have been removed; use the sign-in dialog.

RADAR keeps a small `radar_users` table with the auth UUID and display name for local joins. The signed QStash worker at `/api/worker/auth-user` accepts auth-v2 member snapshots. It ignores older snapshots and safely accepts retries. Signal reads use a left join so records remain visible while a user snapshot is pending.

1. Apply RADAR's Drizzle migrations and deploy the worker. Configure `QSTASH_CURRENT_SIGNING_KEY` and `QSTASH_NEXT_SIGNING_KEY` in RADAR.
2. Configure auth-v2 with `QSTASH_TOKEN`, `QSTASH_URL`, and `RADAR_USER_EVENT_URL=https://radar.gdgbabcock.com/api/worker/auth-user`, then run its `sync-users` command for the initial name backfill.

## Anonymous article views

Public view counts include legacy baselines, signed-in read sessions, and anonymous views. Anonymous views count once per article, IP address, and user agent per UTC day after at least one second of visible reading. Common bot user agents are excluded. IP and user agent values are never stored; the database keeps a keyed SHA-256 fingerprint and article slug. Shared IP addresses with identical user agents may be counted together. This is approximate deduplication, not proof of a unique person.

Set `VIEW_FINGERPRINT_SECRET` to a random secret of at least 32 characters, shared by all RADAR instances. Vercel uses its trusted `x-vercel-forwarded-for` header automatically. Local development uses `x-forwarded-for`. For other production hosting, set `VIEW_IP_HEADER` to the client IP header your reverse proxy overwrites and prevent direct access that bypasses that proxy. Restart RADAR after changing environment variables. Apply the `anonymous_views` migration with `npm run db:migrate` before deploying. Personal reading statistics still require sign-in.

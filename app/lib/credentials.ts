import "server-only";
import { z } from "zod";

const credentialsSchema = z.object({
  sanity_project_id: z.string().min(1).optional(),
  sanity_dataset: z.string().min(1).optional(),
  resend_api_key: z.string().min(1).optional(),
  qstash_url: z.string().min(1).optional(),
  qstash_token: z.string().min(1).optional(),
  qstash_current_signing_key: z.string().min(1).optional(),
  qstash_next_signing_key: z.string().min(1).optional(),
  upstash_redis_rest_url: z.string().min(1).optional(),
  upstash_redis_rest_token: z.string().min(1).optional(),
  auth_api_url: z.string(),
  auth_cookie_name: z.string().min(1).default("gdg_token"),
  auth_refresh_cookie_name: z.string().min(1).default("gdg_refresh_token"),
});

export const CREDENTIALS = credentialsSchema.parse({
  sanity_project_id: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  sanity_dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  resend_api_key: process.env.RESEND_API_KEY,
  qstash_url: process.env.QSTASH_URL,
  qstash_token: process.env.QSTASH_TOKEN,
  qstash_current_signing_key: process.env.QSTASH_CURRENT_SIGNING_KEY,
  qstash_next_signing_key: process.env.QSTASH_NEXT_SIGNING_KEY,
  upstash_redis_rest_url: process.env.UPSTASH_REDIS_REST_URL,
  upstash_redis_rest_token: process.env.UPSTASH_REDIS_REST_TOKEN,
  auth_api_url: process.env.AUTH_API_URL,
  auth_cookie_name: process.env.AUTH_COOKIE_NAME,
  auth_refresh_cookie_name: process.env.AUTH_REFRESH_COOKIE_NAME,
});


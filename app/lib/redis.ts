import { Redis } from "@upstash/redis";
import { CREDENTIALS } from "./constants";

export const redis = new Redis({
  url: CREDENTIALS.upstash_redis_rest_url,
  token: CREDENTIALS.upstash_redis_rest_token,
});

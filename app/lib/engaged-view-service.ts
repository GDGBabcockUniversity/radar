import { randomUUID } from "node:crypto";

export interface EngagedMetricStore {
  reserve(key: string, token: string): Promise<boolean>;
  release(key: string, token: string): Promise<void>;
  increment(key: string): Promise<boolean>;
}

export async function recordEngagedMetric(
  key: string,
  store: EngagedMetricStore,
) {
  const token = randomUUID();
  const reserved = await store.reserve(key, token);
  try {
    // Always consult the transactional durable guard: a Redis reservation may
    // belong to a crashed request, or outlive a failed/ambiguous DB response.
    return await store.increment(key);
  } catch (error) {
    if (reserved) await store.release(key, token).catch(() => {});
    throw error;
  }
}

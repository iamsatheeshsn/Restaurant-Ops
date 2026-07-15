import { logger } from './logger';

// Log caching strategy configuration
logger.info('[Cache] Initialized local in-memory cache (Redis is disabled)');

const inMemoryCache = new Map<string, { value: string; expiresAt: number }>();

class LocalCacheClient {
  async get(key: string): Promise<string | null> {
    const entry = inMemoryCache.get(key);
    if (!entry) return null;
    
    // Check key expiration
    if (Date.now() > entry.expiresAt) {
      inMemoryCache.delete(key);
      return null;
    }
    
    return entry.value;
  }

  async setex(key: string, seconds: number, value: string): Promise<string> {
    inMemoryCache.set(key, {
      value,
      expiresAt: Date.now() + (seconds * 1000)
    });
    return 'OK';
  }

  async quit(): Promise<void> {
    // No-op (no connection pools to close)
  }
}

export const redisClient = new LocalCacheClient();
export const redisConfig = {};

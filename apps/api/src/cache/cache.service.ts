import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

/**
 * In-memory TTL cache for job search results.
 *
 * Keys are MD5 hashes of sorted, stringified search parameters.
 */
@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly store = new Map<string, CacheEntry<any>>();
  private readonly enabled: boolean;
  private readonly expirySec: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(private readonly config: ConfigService) {
    this.enabled = this.config.get<boolean>('cache.enabled', false);
    this.expirySec = this.config.get<number>('cache.expirySec', 3600);

    if (this.enabled) {
      // Periodic cleanup every 5 minutes
      this.cleanupInterval = setInterval(
        () => this.cleanupExpired(),
        5 * 60 * 1000,
      );
      this.logger.log(
        `Cache enabled — TTL ${this.expirySec}s, cleanup every 5 min`,
      );
    } else {
      this.logger.log('Cache disabled');
    }
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }

  /** Generate a deterministic cache key from search parameters. */
  private generateKey(params: Record<string, any>): string {
    const sorted: Record<string, any> = {};
    for (const key of Object.keys(params).sort()) {
      if (params[key] !== undefined && params[key] !== null) {
        sorted[key] = params[key];
      }
    }
    const raw = JSON.stringify(sorted);
    return crypto.createHash('md5').update(raw).digest('hex');
  }

  /** Retrieve cached data, or null if missing / expired. */
  get<T>(params: Record<string, any>): T | null {
    if (!this.enabled) return null;

    const key = this.generateKey(params);
    const entry = this.store.get(key);
    if (!entry) return null;

    const age = (Date.now() - entry.timestamp) / 1000;
    if (age > this.expirySec) {
      this.store.delete(key);
      return null;
    }

    this.logger.debug(`Cache hit (age ${age.toFixed(0)}s)`);
    return entry.data as T;
  }

  /** Store data in cache. */
  set<T>(params: Record<string, any>, data: T): void {
    if (!this.enabled) return;
    const key = this.generateKey(params);
    this.store.set(key, { timestamp: Date.now(), data });
  }

  /** Clear all cached data. */
  clear(): void {
    this.store.clear();
  }

  /** Remove expired entries. */
  private cleanupExpired(): void {
    const now = Date.now();
    let removed = 0;
    for (const [key, entry] of this.store.entries()) {
      if ((now - entry.timestamp) / 1000 > this.expirySec) {
        this.store.delete(key);
        removed++;
      }
    }
    if (removed > 0) {
      this.logger.debug(`Cleaned up ${removed} expired cache entries`);
    }
  }
}

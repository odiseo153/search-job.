import 'reflect-metadata';
import { CacheService } from '../cache.service';

// Mock ConfigService
function createCacheService(opts: { enabled?: boolean; expirySec?: number } = {}): CacheService {
  const config = {
    get: jest.fn((key: string, fallback: any) => {
      if (key === 'cache.enabled') return opts.enabled ?? true;
      if (key === 'cache.expirySec') return opts.expirySec ?? 3600;
      return fallback;
    }),
  };
  return new CacheService(config as any);
}

describe('CacheService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when enabled', () => {
    let cache: CacheService;

    beforeEach(() => {
      cache = createCacheService({ enabled: true, expirySec: 60 });
    });

    afterEach(() => {
      cache.onModuleDestroy();
    });

    it('should store and retrieve values', () => {
      const params = { searchTerm: 'node', endpoint: 'search' };
      cache.set(params, [{ id: 1 }, { id: 2 }]);

      const result = cache.get(params);
      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('should return null for missing keys', () => {
      const result = cache.get({ searchTerm: 'unknown' });
      expect(result).toBeNull();
    });

    it('should generate same key for same params regardless of order', () => {
      cache.set({ a: 1, b: 2 }, 'value');
      const result = cache.get({ b: 2, a: 1 });
      expect(result).toBe('value');
    });

    it('should ignore null/undefined params in key generation', () => {
      cache.set({ a: 1, b: null, c: undefined }, 'value');
      const result = cache.get({ a: 1 });
      expect(result).toBe('value');
    });

    it('should return null for expired entries', () => {
      const params = { searchTerm: 'node' };
      cache.set(params, 'old-data');

      // Advance time past TTL
      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 61_000);

      const result = cache.get(params);
      expect(result).toBeNull();
    });

    it('should clear all entries', () => {
      cache.set({ a: 1 }, 'v1');
      cache.set({ b: 2 }, 'v2');
      cache.clear();

      expect(cache.get({ a: 1 })).toBeNull();
      expect(cache.get({ b: 2 })).toBeNull();
    });
  });

  describe('when disabled', () => {
    let cache: CacheService;

    beforeEach(() => {
      cache = createCacheService({ enabled: false });
    });

    afterEach(() => {
      cache.onModuleDestroy();
    });

    it('should always return null on get', () => {
      cache.set({ a: 1 }, 'value');
      expect(cache.get({ a: 1 })).toBeNull();
    });
  });
});

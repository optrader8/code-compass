// src/utils/cache.ts
import LRU from 'lru-cache';
import * as fs from 'fs';
import * as path from 'path';

export interface CacheOptions {
  max?: number;
  ttl?: number; // time to live in milliseconds
  diskCachePath?: string;
  enableDiskCache?: boolean;
}

export interface CacheStats {
  hitRate: number;
  missRate: number;
  evictionCount: number;
  memoryUsage: number;
  diskUsage: number;
  entryCount: number;
}

export interface FileHashCache {
  [filePath: string]: {
    hash: string;
    timestamp: number;
  };
}

export class CacheSystem {
  private memoryCache: LRU<string, any>;
  private fileHashCache: FileHashCache = {};
  private diskCachePath?: string;
  private enableDiskCache: boolean;
  private stats: {
    hits: number;
    misses: number;
    evictions: number;
  };

  constructor(options: CacheOptions = {}) {
    // Default to 500 entries max, with 10 minute TTL
    const max = options.max || 500;
    const ttl = options.ttl || 10 * 60 * 1000; // 10 minutes in milliseconds
    this.diskCachePath = options.diskCachePath || '.code-compass-cache';
    this.enableDiskCache = options.enableDiskCache ?? false;

    this.memoryCache = new LRU<string, any>({
      max,
      ttl,
      dispose: () => {
        this.stats.evictions++;
      },
    });

    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
    };

    // Initialize disk cache if enabled
    if (this.enableDiskCache) {
      this.initDiskCache();
    }
  }

  private initDiskCache(): void {
    if (!this.diskCachePath) return;

    try {
      if (!fs.existsSync(this.diskCachePath)) {
        fs.mkdirSync(this.diskCachePath, { recursive: true });
      }
    } catch (error) {
      console.error('Failed to initialize disk cache:', error);
      this.enableDiskCache = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    // First try memory cache
    const memoryValue = this.memoryCache.get(key);
    if (memoryValue !== undefined) {
      this.stats.hits++;
      return memoryValue as T;
    }

    // Then try disk cache if enabled
    if (this.enableDiskCache && this.diskCachePath) {
      try {
        const diskCachePath = path.join(this.diskCachePath, `${key}.json`);
        if (fs.existsSync(diskCachePath)) {
          const data = fs.readFileSync(diskCachePath, 'utf-8');
          const value = JSON.parse(data);
          // Put it back in memory cache for faster access next time
          this.memoryCache.set(key, value);
          this.stats.hits++;
          return value as T;
        }
      } catch (error) {
        console.error(`Error reading from disk cache for key ${key}:`, error);
      }
    }

    this.stats.misses++;
    return null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    // Set in memory cache
    this.memoryCache.set(key, value, { ttl });

    // Set in disk cache if enabled
    if (this.enableDiskCache && this.diskCachePath) {
      try {
        const diskCachePath = path.join(this.diskCachePath, `${key}.json`);
        const serializedValue = JSON.stringify(value);
        fs.writeFileSync(diskCachePath, serializedValue, 'utf-8');
      } catch (error) {
        console.error(`Error writing to disk cache for key ${key}:`, error);
      }
    }
  }

  async has(key: string): Promise<boolean> {
    return (
      this.memoryCache.has(key) ||
      (this.enableDiskCache &&
        this.diskCachePath &&
        fs.existsSync(path.join(this.diskCachePath, `${key}.json`)))
    );
  }

  async delete(key: string): Promise<boolean> {
    const memoryDeleted = this.memoryCache.delete(key);
    let diskDeleted = false;

    if (this.enableDiskCache && this.diskCachePath) {
      try {
        const diskCachePath = path.join(this.diskCachePath, `${key}.json`);
        if (fs.existsSync(diskCachePath)) {
          fs.unlinkSync(diskCachePath);
          diskDeleted = true;
        }
      } catch (error) {
        console.error(`Error deleting from disk cache for key ${key}:`, error);
      }
    }

    return memoryDeleted || diskDeleted;
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();

    if (this.enableDiskCache && this.diskCachePath) {
      try {
        const files = fs.readdirSync(this.diskCachePath);
        for (const file of files) {
          if (file.endsWith('.json')) {
            fs.unlinkSync(path.join(this.diskCachePath, file));
          }
        }
      } catch (error) {
        console.error('Error clearing disk cache:', error);
      }
    }

    this.fileHashCache = {};
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
    };
  }

  async invalidate(key: string): Promise<void> {
    await this.delete(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    // Invalidate from memory cache
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
      }
    }

    // Invalidate from disk cache
    if (this.enableDiskCache && this.diskCachePath) {
      try {
        const files = fs.readdirSync(this.diskCachePath);
        for (const file of files) {
          if (file.includes(pattern) && file.endsWith('.json')) {
            fs.unlinkSync(path.join(this.diskCachePath, file));
          }
        }
      } catch (error) {
        console.error('Error invalidating disk cache by pattern:', error);
      }
    }
  }

  // File-based invalidation methods
  async invalidateFile(filePath: string): Promise<void> {
    // Remove file hash from cache
    delete this.fileHashCache[filePath];

    // Find and invalidate any cache entries related to this file
    await this.invalidatePattern(filePath);
  }

  async invalidateDirectory(dirPath: string): Promise<void> {
    // Invalidate all file hashes in this directory
    for (const filePath in this.fileHashCache) {
      if (filePath.startsWith(dirPath)) {
        delete this.fileHashCache[filePath];
      }
    }

    // Find and invalidate any cache entries related to files in this directory
    await this.invalidatePattern(dirPath);
  }

  async getStats(): Promise<CacheStats> {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
    const missRate = totalRequests > 0 ? this.stats.misses / totalRequests : 0;

    // Approximate memory usage (this is a simplification)
    let memoryUsage = 0;
    for (const key of this.memoryCache.keys()) {
      const value = this.memoryCache.get(key);
      // This is a very rough estimation
      memoryUsage += JSON.stringify({ key, value }).length;
    }

    // Calculate disk usage if disk cache is enabled
    let diskUsage = 0;
    if (this.enableDiskCache && this.diskCachePath) {
      try {
        const files = fs.readdirSync(this.diskCachePath);
        for (const file of files) {
          if (file.endsWith('.json')) {
            const filePath = path.join(this.diskCachePath, file);
            const stats = fs.statSync(filePath);
            diskUsage += stats.size;
          }
        }
      } catch (error) {
        console.error('Error calculating disk cache usage:', error);
      }
    }

    return {
      hitRate,
      missRate,
      evictionCount: this.stats.evictions,
      memoryUsage,
      diskUsage,
      entryCount: this.memoryCache.size,
    };
  }

  // Additional cache management methods
  async getSize(): Promise<number> {
    return this.memoryCache.size;
  }

  async keys(): Promise<string[]> {
    return Array.from(this.memoryCache.keys());
  }

  // File hash management for incremental parsing
  async getFileHash(filePath: string): Promise<string> {
    const stats = await fs.promises.stat(filePath);
    const mtime = stats.mtime.getTime();

    // Check if we already have the hash for this file with the same timestamp
    const cached = this.fileHashCache[filePath];
    if (cached && cached.timestamp === mtime) {
      return cached.hash;
    }

    // Calculate and cache the new hash
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const hash = this.calculateHash(content);

    this.fileHashCache[filePath] = {
      hash,
      timestamp: mtime,
    };

    return hash;
  }

  // Method to check if file has changed since last cache
  async isFileChanged(filePath: string): Promise<boolean> {
    try {
      const currentHash = await this.getFileHash(filePath);
      const cachedValue = await this.get<any>(`ast:${filePath}:${currentHash}`);
      return cachedValue === null;
    } catch (error) {
      // If there's an error reading the file, assume it changed
      return true;
    }
  }

  private calculateHash(content: string): string {
    // Simple hash function for demonstration
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }
}

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheSystem = void 0;
// src/utils/cache.ts
const lru_cache_1 = __importDefault(require("lru-cache"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class CacheSystem {
    constructor(options = {}) {
        this.fileHashCache = {};
        // Default to 500 entries max, with 10 minute TTL
        const max = options.max || 500;
        const ttl = options.ttl || 10 * 60 * 1000; // 10 minutes in milliseconds
        this.diskCachePath = options.diskCachePath || '.code-compass-cache';
        this.enableDiskCache = options.enableDiskCache ?? false;
        this.memoryCache = new lru_cache_1.default({
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
    initDiskCache() {
        if (!this.diskCachePath)
            return;
        try {
            if (!fs.existsSync(this.diskCachePath)) {
                fs.mkdirSync(this.diskCachePath, { recursive: true });
            }
        }
        catch (error) {
            console.error('Failed to initialize disk cache:', error);
            this.enableDiskCache = false;
        }
    }
    async get(key) {
        // First try memory cache
        const memoryValue = this.memoryCache.get(key);
        if (memoryValue !== undefined) {
            this.stats.hits++;
            return memoryValue;
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
                    return value;
                }
            }
            catch (error) {
                console.error(`Error reading from disk cache for key ${key}:`, error);
            }
        }
        this.stats.misses++;
        return null;
    }
    async set(key, value, ttl) {
        // Set in memory cache
        this.memoryCache.set(key, value, { ttl });
        // Set in disk cache if enabled
        if (this.enableDiskCache && this.diskCachePath) {
            try {
                const diskCachePath = path.join(this.diskCachePath, `${key}.json`);
                const serializedValue = JSON.stringify(value);
                fs.writeFileSync(diskCachePath, serializedValue, 'utf-8');
            }
            catch (error) {
                console.error(`Error writing to disk cache for key ${key}:`, error);
            }
        }
    }
    async has(key) {
        if (this.memoryCache.has(key)) {
            return true;
        }
        if (this.enableDiskCache && this.diskCachePath) {
            return fs.existsSync(path.join(this.diskCachePath, `${key}.json`));
        }
        return false;
    }
    async delete(key) {
        const memoryDeleted = this.memoryCache.delete(key);
        let diskDeleted = false;
        if (this.enableDiskCache && this.diskCachePath) {
            try {
                const diskCachePath = path.join(this.diskCachePath, `${key}.json`);
                if (fs.existsSync(diskCachePath)) {
                    fs.unlinkSync(diskCachePath);
                    diskDeleted = true;
                }
            }
            catch (error) {
                console.error(`Error deleting from disk cache for key ${key}:`, error);
            }
        }
        return memoryDeleted || diskDeleted;
    }
    async clear() {
        this.memoryCache.clear();
        if (this.enableDiskCache && this.diskCachePath) {
            try {
                const files = fs.readdirSync(this.diskCachePath);
                for (const file of files) {
                    if (file.endsWith('.json')) {
                        fs.unlinkSync(path.join(this.diskCachePath, file));
                    }
                }
            }
            catch (error) {
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
    async invalidate(key) {
        await this.delete(key);
    }
    async invalidatePattern(pattern) {
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
            }
            catch (error) {
                console.error('Error invalidating disk cache by pattern:', error);
            }
        }
    }
    // File-based invalidation methods
    async invalidateFile(filePath) {
        // Remove file hash from cache
        delete this.fileHashCache[filePath];
        // Find and invalidate any cache entries related to this file
        await this.invalidatePattern(filePath);
    }
    async invalidateDirectory(dirPath) {
        // Invalidate all file hashes in this directory
        for (const filePath in this.fileHashCache) {
            if (filePath.startsWith(dirPath)) {
                delete this.fileHashCache[filePath];
            }
        }
        // Find and invalidate any cache entries related to files in this directory
        await this.invalidatePattern(dirPath);
    }
    async getStats() {
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
            }
            catch (error) {
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
    async getSize() {
        return this.memoryCache.size;
    }
    async keys() {
        return Array.from(this.memoryCache.keys());
    }
    // File hash management for incremental parsing
    async getFileHash(filePath) {
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
    async isFileChanged(filePath) {
        try {
            const currentHash = await this.getFileHash(filePath);
            const cachedValue = await this.get(`ast:${filePath}:${currentHash}`);
            return cachedValue === null;
        }
        catch (error) {
            // If there's an error reading the file, assume it changed
            return true;
        }
    }
    calculateHash(content) {
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
exports.CacheSystem = CacheSystem;
//# sourceMappingURL=cache.js.map
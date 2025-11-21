export interface CacheOptions {
    max?: number;
    ttl?: number;
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
export declare class CacheSystem {
    private memoryCache;
    private fileHashCache;
    private diskCachePath?;
    private enableDiskCache;
    private stats;
    constructor(options?: CacheOptions);
    private initDiskCache;
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    has(key: string): Promise<boolean>;
    delete(key: string): Promise<boolean>;
    clear(): Promise<void>;
    invalidate(key: string): Promise<void>;
    invalidatePattern(pattern: string): Promise<void>;
    invalidateFile(filePath: string): Promise<void>;
    invalidateDirectory(dirPath: string): Promise<void>;
    getStats(): Promise<CacheStats>;
    getSize(): Promise<number>;
    keys(): Promise<string[]>;
    getFileHash(filePath: string): Promise<string>;
    isFileChanged(filePath: string): Promise<boolean>;
    private calculateHash;
}
//# sourceMappingURL=cache.d.ts.map
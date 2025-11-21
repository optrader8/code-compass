/// <reference types="node" />
import { EventEmitter } from 'events';
export interface FileChangeEvent {
    filePath: string;
    eventType: 'create' | 'update' | 'delete';
    timestamp: Date;
}
export interface WatcherOptions {
    interval?: number;
    ignoreInitial?: boolean;
    ignore?: string[];
}
export declare class FileWatcher extends EventEmitter {
    private watchedPaths;
    private fileHashes;
    private intervalId?;
    private options;
    private stopRequested;
    constructor(options?: WatcherOptions);
    watch(paths: string | string[]): Promise<void>;
    private watchDirectory;
    private watchFile;
    private walkDirectory;
    private startPolling;
    private checkForChanges;
    private shouldIgnoreFile;
    private calculateHash;
    stop(): Promise<void>;
    addPath(newPath: string): Promise<void>;
    removePath(pathToRemove: string): void;
}
//# sourceMappingURL=file-watcher.d.ts.map
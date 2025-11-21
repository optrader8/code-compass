// src/utils/file-watcher.ts
import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';

export interface FileChangeEvent {
  filePath: string;
  eventType: 'create' | 'update' | 'delete';
  timestamp: Date;
}

export interface WatcherOptions {
  interval?: number; // polling interval in ms
  ignoreInitial?: boolean; // whether to ignore initial scan events
  ignore?: string[]; // patterns to ignore
}

export class FileWatcher extends EventEmitter {
  private watchedPaths: Set<string> = new Set();
  private fileHashes: Map<string, string> = new Map();
  private intervalId?: NodeJS.Timeout;
  private options: WatcherOptions;
  private stopRequested: boolean = false;

  constructor(options: WatcherOptions = {}) {
    super();
    this.options = {
      interval: options.interval || 2000, // default to 2 seconds
      ignoreInitial: options.ignoreInitial || true,
      ignore: options.ignore || [],
    };
  }

  async watch(paths: string | string[]): Promise<void> {
    const pathArray = Array.isArray(paths) ? paths : [paths];

    for (const p of pathArray) {
      if (fs.statSync(p).isDirectory()) {
        await this.watchDirectory(p);
      } else {
        this.watchFile(p);
      }
    }

    // Start the polling loop
    this.startPolling();
  }

  private async watchDirectory(dirPath: string): Promise<void> {
    const files = await this.walkDirectory(dirPath);

    for (const filePath of files) {
      // Check if file should be ignored
      if (this.shouldIgnoreFile(filePath)) {
        continue;
      }

      this.watchFile(filePath);
    }
  }

  private watchFile(filePath: string): void {
    this.watchedPaths.add(filePath);

    // Calculate initial hash
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const hash = this.calculateHash(content);
      this.fileHashes.set(filePath, hash);
    }
  }

  private async walkDirectory(dirPath: string): Promise<string[]> {
    const files: string[] = [];

    const items = await fs.promises.readdir(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = await fs.promises.stat(fullPath);

      if (stat.isDirectory()) {
        const subFiles = await this.walkDirectory(fullPath);
        files.push(...subFiles);
      } else {
        files.push(fullPath);
      }
    }

    return files;
  }

  private startPolling(): void {
    this.intervalId = setInterval(async () => {
      if (this.stopRequested) {
        if (this.intervalId) {
          clearInterval(this.intervalId);
        }
        return;
      }

      await this.checkForChanges();
    }, this.options.interval);
  }

  private async checkForChanges(): Promise<void> {
    for (const filePath of this.watchedPaths) {
      try {
        if (!fs.existsSync(filePath)) {
          // File was deleted
          if (this.fileHashes.has(filePath)) {
            this.emit('change', {
              filePath,
              eventType: 'delete',
              timestamp: new Date(),
            } as FileChangeEvent);

            this.fileHashes.delete(filePath);
          }
          continue;
        }

        const content = await fs.promises.readFile(filePath, 'utf-8');
        const currentHash = this.calculateHash(content);
        const previousHash = this.fileHashes.get(filePath);

        if (!previousHash) {
          // New file
          if (!this.options.ignoreInitial) {
            this.emit('change', {
              filePath,
              eventType: 'create',
              timestamp: new Date(),
            } as FileChangeEvent);
          }
          this.fileHashes.set(filePath, currentHash);
        } else if (previousHash !== currentHash) {
          // File was modified
          this.emit('change', {
            filePath,
            eventType: 'update',
            timestamp: new Date(),
          } as FileChangeEvent);

          this.fileHashes.set(filePath, currentHash);
        }
      } catch (error) {
        console.error(`Error checking file ${filePath}:`, error);
      }
    }
  }

  private shouldIgnoreFile(filePath: string): boolean {
    for (const pattern of this.options.ignore) {
      if (filePath.includes(pattern)) {
        return true;
      }
    }
    return false;
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

  async stop(): Promise<void> {
    this.stopRequested = true;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  async addPath(newPath: string): Promise<void> {
    if (fs.statSync(newPath).isDirectory()) {
      await this.watchDirectory(newPath);
    } else {
      this.watchFile(newPath);
    }
  }

  removePath(pathToRemove: string): void {
    this.watchedPaths.delete(pathToRemove);
    this.fileHashes.delete(pathToRemove);
  }
}

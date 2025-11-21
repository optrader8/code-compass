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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileWatcher = void 0;
// src/utils/file-watcher.ts
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const events_1 = require("events");
class FileWatcher extends events_1.EventEmitter {
    constructor(options = {}) {
        super();
        this.watchedPaths = new Set();
        this.fileHashes = new Map();
        this.stopRequested = false;
        this.options = {
            interval: options.interval ?? 2000,
            ignoreInitial: options.ignoreInitial ?? true,
            ignore: options.ignore ?? [],
        };
    }
    async watch(paths) {
        const pathArray = Array.isArray(paths) ? paths : [paths];
        for (const p of pathArray) {
            if (fs.statSync(p).isDirectory()) {
                await this.watchDirectory(p);
            }
            else {
                this.watchFile(p);
            }
        }
        // Start the polling loop
        this.startPolling();
    }
    async watchDirectory(dirPath) {
        const files = await this.walkDirectory(dirPath);
        for (const filePath of files) {
            // Check if file should be ignored
            if (this.shouldIgnoreFile(filePath)) {
                continue;
            }
            this.watchFile(filePath);
        }
    }
    watchFile(filePath) {
        this.watchedPaths.add(filePath);
        // Calculate initial hash
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            const hash = this.calculateHash(content);
            this.fileHashes.set(filePath, hash);
        }
    }
    async walkDirectory(dirPath) {
        const files = [];
        const items = await fs.promises.readdir(dirPath);
        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const stat = await fs.promises.stat(fullPath);
            if (stat.isDirectory()) {
                const subFiles = await this.walkDirectory(fullPath);
                files.push(...subFiles);
            }
            else {
                files.push(fullPath);
            }
        }
        return files;
    }
    startPolling() {
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
    async checkForChanges() {
        for (const filePath of this.watchedPaths) {
            try {
                if (!fs.existsSync(filePath)) {
                    // File was deleted
                    if (this.fileHashes.has(filePath)) {
                        this.emit('change', {
                            filePath,
                            eventType: 'delete',
                            timestamp: new Date(),
                        });
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
                        });
                    }
                    this.fileHashes.set(filePath, currentHash);
                }
                else if (previousHash !== currentHash) {
                    // File was modified
                    this.emit('change', {
                        filePath,
                        eventType: 'update',
                        timestamp: new Date(),
                    });
                    this.fileHashes.set(filePath, currentHash);
                }
            }
            catch (error) {
                console.error(`Error checking file ${filePath}:`, error);
            }
        }
    }
    shouldIgnoreFile(filePath) {
        for (const pattern of this.options.ignore) {
            if (filePath.includes(pattern)) {
                return true;
            }
        }
        return false;
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
    async stop() {
        this.stopRequested = true;
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }
    async addPath(newPath) {
        if (fs.statSync(newPath).isDirectory()) {
            await this.watchDirectory(newPath);
        }
        else {
            this.watchFile(newPath);
        }
    }
    removePath(pathToRemove) {
        this.watchedPaths.delete(pathToRemove);
        this.fileHashes.delete(pathToRemove);
    }
}
exports.FileWatcher = FileWatcher;
//# sourceMappingURL=file-watcher.js.map
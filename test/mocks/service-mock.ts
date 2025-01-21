import { EventEmitter } from 'events';
import { ServiceManager } from '../../src/services';
import { ComfyUIService } from '../../src/services/comfyui-manager';

export class MockServiceManager extends ServiceManager {
    private services: Map<string, any> = new Map();
    public isInitialized: boolean = false;

    async init(): Promise<void> {
        this.isInitialized = true;
    }

    addService(name: string, service: any): void {
        this.services.set(name, service);
    }

    getService(name: string): any {
        return this.services.get(name);
    }
}

export class MockComfyUIService extends ComfyUIService {
    private process: any;

    setupProcessHandlers(): void {
        // Mock implementation
    }

    async waitForServer(): Promise<void> {
        // Mock implementation
    }
    public pythonEnv: any;
    private _isRunning: boolean = false;
    public startupDelay: number = 0;
    public shouldFail: boolean = false;

    readonly config = {
        port: 8188,
        host: 'localhost'
    };

    async start(): Promise<void> {
        if (this.shouldFail) throw new Error('Start failed');
        if (this.startupDelay > 0) {
            await new Promise(resolve => setTimeout(resolve, this.startupDelay));
        }
        this._isRunning = true;
    }

    async stop(): Promise<void> {
        if (this.shouldFail) throw new Error('Stop failed');
        this._isRunning = false;
    }

    isRunning(): boolean {
        return this._isRunning;
    }
}
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { PythonEnvironmentManager } from '../utils/python-env';

interface ComfyUIConfig {
    port: number;
    host: string;
    extraArgs?: string[];
}

export class ComfyUIService {
    private process: ChildProcess | null = null;
    private pythonEnv: PythonEnvironmentManager;
    private config: ComfyUIConfig;

    constructor(config: Partial<ComfyUIConfig> = {}) {
        this.pythonEnv = new PythonEnvironmentManager();
        this.config = {
            port: config.port || 8188,
            host: config.host || 'localhost',
            extraArgs: config.extraArgs || []
        };
    }

    async start(): Promise<void> {
        try {
            await this.pythonEnv.setupEnvironment();
            
            const pythonScript = path.join(__dirname, '../../comfyui/main.py');
            const args = [
                pythonScript,
                '--port', this.config.port.toString(),
                '--host', this.config.host,
                ...(this.config.extraArgs || [])
            ];

            this.process = spawn('python', args, {
                cwd: path.join(__dirname, '../../comfyui')
            });

            this.setupProcessHandlers();
            
            // Wait for server to start
            await this.waitForServer();
        } catch (err: unknown) {
            const error = err as Error;
            throw new Error(`Failed to start ComfyUI: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private setupProcessHandlers(): void {
        if (!this.process) return;

        this.process.stdout?.on('data', (data) => {
            console.log(`ComfyUI: ${data}`);
        });

        this.process.stderr?.on('data', (data) => {
            console.error(`ComfyUI Error: ${data}`);
        });

        this.process.on('close', (code) => {
            console.log(`ComfyUI process exited with code ${code}`);
            this.process = null;
        });
    }

    private async waitForServer(): Promise<void> {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Server startup timeout'));
            }, 30000);

            const checkInterval = setInterval(() => {
                if (this.isRunning()) {
                    clearTimeout(timeout);
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 1000);
        });
    }

    async stop(): Promise<void> {
        if (this.process) {
            this.process.kill();
            this.process = null;
        }
    }

    isRunning(): boolean {
        return this.process !== null && !this.process.killed;
    }
}
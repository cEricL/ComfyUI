import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export class PythonEnvironmentManager {
    private comfyuiPath: string;
    private venvPath: string;

    constructor() {
        this.comfyuiPath = path.join(__dirname, '../../comfyui');
        this.venvPath = path.join(this.comfyuiPath, 'venv');
    }

    async setupEnvironment(): Promise<void> {
        try {
            const pythonVersion = await this.checkPythonVersion();
            console.log(`Python version: ${pythonVersion}`);

            await this.createVirtualEnv();
            await this.installRequirements();
        } catch (err: unknown) {
            const error = err as Error;
            throw new Error(`Environment setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    public checkPythonVersion(): Promise<string> {
        return new Promise((resolve, reject) => {
            const python = spawn('python', ['--version']);
            let output = '';
                
            python.stdout.on('data', (data) => {
                output += data.toString();
            });

            python.stderr.on('data', (data) => {
                reject(new Error(`Python check failed: ${data}`));
            });

            python.on('close', (code) => {
                if (code === 0) {
                    resolve(output.trim());
                } else {
                    reject(new Error('Python is not installed or not in PATH'));
                }
            });
        });
    }

    private async createVirtualEnv(): Promise<void> {
        if (fs.existsSync(this.venvPath)) {
            console.log('Virtual environment already exists');
            return;
        }

        return new Promise((resolve, reject) => {
            const venv = spawn('python', ['-m', 'venv', 'venv'], {
                cwd: this.comfyuiPath
            });

            venv.stdout.on('data', (data) => {
                console.log(`venv: ${data}`);
            });

            venv.stderr.on('data', (data) => {
                console.error(`venv error: ${data}`);
            });

            venv.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Virtual environment creation failed with code ${code}`));
                }
            });
        });
    }

    private async installRequirements(): Promise<void> {
        const pipPath = path.join(this.venvPath, 'Scripts', 'pip.exe');
        
        return new Promise((resolve, reject) => {
            const pip = spawn(pipPath, ['install', '-r', 'requirements.txt'], {
                cwd: this.comfyuiPath
            });

            pip.stdout.on('data', (data) => {
                console.log(`pip: ${data}`);
            });

            pip.stderr.on('data', (data) => {
                console.error(`pip error: ${data}`);
            });

            pip.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`pip install failed with code ${code}`));
                }
            });
        });
    }

    async cleanup(): Promise<void> {
        if (fs.existsSync(this.venvPath)) {
            fs.rmSync(this.venvPath, { recursive: true });
        }
    }
}
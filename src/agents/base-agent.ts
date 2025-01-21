import { EventEmitter } from 'events';
import { Agent, AgentConfig, AgentStatus, AgentTask, AgentState } from '../types/agent';

export abstract class BaseAgent extends EventEmitter implements Agent {
    private _status: AgentStatus;
    private taskQueue: AgentTask[] = [];
    private readonly maxRetries = 3;
    private readonly taskTimeout = 5000;

    constructor(readonly config: AgentConfig) {
        super();
        this._status = {
            id: config.id,
            state: 'initializing',
            lastUpdated: new Date()
        };
    }

    get status(): AgentStatus {
        return { ...this._status };
    }

    protected setState(state: AgentState, error?: string): void {
        const previousState = this._status.state;
        this._status = {
            ...this._status,
            state,
            error,
            lastUpdated: new Date()
        };
        console.log(`Agent ${this.config.id}: State changed from ${previousState} to ${state}${error ? `. Error: ${error}` : ''}`);
        this.emit('stateChange', { 
            previousState, 
            currentState: state, 
            error 
        });
    }

    protected async addTask(task: AgentTask): Promise<void> {
        console.log(`Agent ${this.config.id}: Adding task ${task.id}`);
        this.validateTask(task);
        this.taskQueue.push(task);
        this.taskQueue.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        this.emit('taskQueued', task);
        await this.processNextTask();
    }

    private validateTask(task: AgentTask): void {
        if (!task.id || !task.type) {
            throw new Error('Invalid task: missing required fields');
        }
        if (task.deadline && new Date(task.deadline) < new Date()) {
            throw new Error('Invalid task: deadline has passed');
        }
    }

    private async processNextTask(): Promise<void> {
        if (this._status.state !== 'running' || this.taskQueue.length === 0) {
            return;
        }

        const task = this.taskQueue.shift();
        if (task) {
            console.log(`Agent ${this.config.id}: Processing task ${task.id}`);
            try {
                const result = await this.executeWithTimeout(task);
                console.log(`Agent ${this.config.id}: Task ${task.id} completed successfully`);
                this.emit('taskComplete', { task, result });
            } catch (error) {
                console.error(`Agent ${this.config.id}: Task ${task.id} failed:`, error);
                this.emit('taskError', { task, error });
                this.setState('error', error instanceof Error ? error.message : 'Unknown error');
            }
        }
    }

    private async executeWithTimeout(task: AgentTask, retries = 0): Promise<unknown> {
        try {
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Task timeout')), this.taskTimeout);
            });
            return await Promise.race([this.execute(task), timeoutPromise]);
        } catch (error) {
            if (retries < this.maxRetries) {
                return this.executeWithTimeout(task, retries + 1);
            }
            throw error;
        }
    }

    async initialize(): Promise<void> {
        try {
            await this.onInitialize();
            this.setState('idle');
        } catch (error) {
            this.setState('error', error instanceof Error ? error.message : 'Unknown error');
            throw error;
        }
    }

    async start(): Promise<void> {
        if (this._status.state !== 'idle') {
            throw new Error(`Cannot start agent in ${this._status.state} state`);
        }
        this.setState('running');
        await this.onStart();
    }

    async stop(): Promise<void> {
        if (this._status.state !== 'running') {
            throw new Error(`Cannot stop agent in ${this._status.state} state`);
        }
        this.setState('stopped');
        await this.onStop();
    }

    async execute(task: AgentTask): Promise<unknown> {
        if (this._status.state !== 'running') {
            throw new Error(`Cannot execute task in ${this._status.state} state`);
        }
        return this.onExecute(task);
    }

    async dispose(): Promise<void> {
        console.log(`Agent ${this.config.id}: Disposing...`);
        try {
            if (this._status.state === 'running') {
                await this.stop();
            }
            this.clearTasks();
            this.removeAllListeners();
            await this.onDispose();
            this.setState('stopped');
            console.log(`Agent ${this.config.id}: Disposed successfully`);
        } catch (error) {
            console.error(`Agent ${this.config.id}: Disposal failed:`, error);
            this.setState('error', error instanceof Error ? error.message : 'Unknown error');
            throw error;
        }
    }

    protected clearTasks(): void {
        const remainingTasks = [...this.taskQueue];
        this.taskQueue = [];
        this.emit('tasksCleared', remainingTasks);
    }

    protected validateStateTransition(fromState: AgentState, toState: AgentState): boolean {
        const validTransitions: Record<AgentState, AgentState[]> = {
            'initializing': ['idle', 'error'],
            'idle': ['running', 'error'],
            'running': ['stopped', 'error'],
            'stopped': ['idle', 'error'],
            'error': ['idle']
        };
        return validTransitions[fromState]?.includes(toState) ?? false;
    }

    protected abstract onInitialize(): Promise<void>;
    protected abstract onStart(): Promise<void>;
    protected abstract onStop(): Promise<void>;
    protected abstract onExecute(task: AgentTask): Promise<unknown>;
    protected abstract onDispose(): Promise<void>;
}
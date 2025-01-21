export type AgentType = 'workflow' | 'service' | 'task' | 'monitor';

export type AgentState = 'initializing' | 'idle' | 'running' | 'error' | 'stopped';

export interface AgentConfig {
    id: string;
    name: string;
    type: AgentType;
    parameters?: Record<string, unknown>;
}

export interface AgentStatus {
    id: string;
    state: AgentState;
    lastUpdated: Date;
    error?: string;
}

export interface AgentTask {
    id: string;
    type: string;
    payload: unknown;
    priority?: number;
    deadline?: Date;
}

export interface Agent {
    readonly config: AgentConfig;
    readonly status: AgentStatus;
    initialize(): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    execute(task: AgentTask): Promise<unknown>;
}
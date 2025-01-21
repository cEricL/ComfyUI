import { BaseAgent } from '../../src/agents/base-agent';
import { AgentTask } from '../../src/types/agent';

export class TestAgent extends BaseAgent {
    public lastExecutedTask: AgentTask | null = null;
    public executionDelay: number = 0;
    public shouldFail: boolean = false;

    protected async onInitialize(): Promise<void> {
        if (this.shouldFail) throw new Error('Initialize failed');
    }

    protected async onStart(): Promise<void> {
        if (this.shouldFail) throw new Error('Start failed');
    }

    protected async onStop(): Promise<void> {
        if (this.shouldFail) throw new Error('Stop failed');
    }

    protected async onDispose(): Promise<void> {
        if (this.shouldFail) throw new Error('Dispose failed');
    }

    protected async onExecute(task: AgentTask): Promise<unknown> {
        if (this.executionDelay > 0) {
            await new Promise(resolve => setTimeout(resolve, this.executionDelay));
        }
        
        if (this.shouldFail) throw new Error('Execute failed');
        
        this.lastExecutedTask = task;
        return task.payload;
    }
}
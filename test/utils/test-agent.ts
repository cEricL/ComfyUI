import { BaseAgent } from '../../src/agents/base-agent';
import { AgentTask } from '../../src/types/agent';

export class TestAgent extends BaseAgent {
    public lastExecutedTask: AgentTask | null = null;

    protected async onInitialize(): Promise<void> {}
    protected async onStart(): Promise<void> {}
    protected async onStop(): Promise<void> {}
    protected async onDispose(): Promise<void> {}
    protected async onExecute(task: AgentTask): Promise<unknown> {
        this.lastExecutedTask = task;
        return task.payload;
    }
}
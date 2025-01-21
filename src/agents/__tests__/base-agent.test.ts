import { expect } from 'chai';
import { BaseAgent } from '../base-agent';
import { AgentConfig, AgentTask } from '../../types/agent';

class TestAgent extends BaseAgent {
    protected async onInitialize(): Promise<void> {}
    protected async onStart(): Promise<void> {}
    protected async onStop(): Promise<void> {}
    protected async onDispose(): Promise<void> {}
    protected async onExecute(task: AgentTask): Promise<unknown> {
        return task.payload;
    }
}

describe('BaseAgent', () => {
    let agent: TestAgent;
    const config: AgentConfig = {
        id: 'test-agent',
        name: 'Test Agent',
        type: 'task'
    };

    beforeEach(() => {
        agent = new TestAgent(config);
    });

    afterEach(async () => {
        await agent.dispose();
    });

    it('initializes with correct config', () => {
        expect(agent.config).to.deep.equal(config);
        expect(agent.status.state).to.equal('initializing');
    });

    it('follows correct lifecycle', async () => {
        await agent.initialize();
        expect(agent.status.state).to.equal('idle');

        await agent.start();
        expect(agent.status.state).to.equal('running');

        await agent.stop();
        expect(agent.status.state).to.equal('stopped');
    });

    it('handles tasks correctly', async () => {
        await agent.initialize();
        await agent.start();

        const task: AgentTask = {
            id: 'test-task',
            type: 'test',
            payload: { data: 'test' }
        };

        const result = await agent.execute(task);
        expect(result).to.deep.equal(task.payload);
    });

    it('handles errors appropriately', async () => {
        try {
            await agent.start();
            expect.fail('Should have thrown an error');
        } catch (error) {
            expect(agent.status.state).to.equal('error');
        }
    });
});

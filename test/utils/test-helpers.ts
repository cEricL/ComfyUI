import { AgentConfig, AgentTask } from '../../src/types/agent';

export const createTestConfig = (id: string): AgentConfig => ({
    id,
    name: `Test Agent ${id}`,
    type: 'task'
});

export const createTestTask = (id: string): AgentTask => ({
    id,
    type: 'test',
    payload: { data: 'test' }
});
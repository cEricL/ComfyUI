export interface Requirement {
    id: string;
    description: string;
    priority: number;
    status: 'pending' | 'in-progress' | 'completed';
}

export interface Service {
    id: string;
    name: string;
    description: string;
}

export interface ProjectFlow {
    id: string;
    name: string;
    steps: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Agent {
    id: string;
    name: string;
    tasks: string[];
}
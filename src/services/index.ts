import { Router } from 'express';

export const serviceRouter = Router();

serviceRouter.get('/', (req, res) => {
  res.send('Service endpoint');
});

export const agentRouter = Router();

agentRouter.get('/', (req, res) => {
  res.send('Agent endpoint');
});

interface Service {
  name: string;
  execute: (...args: any[]) => any;
}

export interface Agent {
  id: string;
  name: string;
  tasks: string[];
}

export class ServiceManager {
  private services: Map<string, Service> = new Map();

  addService(name: string, service: Service): void {
    this.services.set(name, service);
  }

  executeService(name: string, ...args: any[]): any {
    const service = this.services.get(name);
    if (service) {
      return service.execute(...args);
    } else {
      throw new Error(`Service ${name} not found`);
    }
  }

  async init(): Promise<void> {
    // Initialize service manager
    return Promise.resolve();
  }
}
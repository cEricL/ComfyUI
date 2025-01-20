// src/main.ts

import { ComfyUI } from './ui/comfy-ui';
import Agent from './agents/index';
import { ServiceManager } from './services/index';
import express from 'express';
import { agentRouter } from './agents';
import { serviceRouter } from './services';

const comfyUI = new ComfyUI();
const agent = new Agent();
const serviceManager = new ServiceManager();
const app = express();
const port = process.env.PORT || 3000;

function initializeApp() {
    comfyUI.renderUI();
    // Additional initialization logic can be added here
}

function startMainProcesses() {
    // Load agents and services
    agent.generateRequirements();
    agent.prioritizeRequirements();
    agent.documentProjectFlows();
    agent.monetizeServices();

    // Start service management
    serviceManager.addService('defaultService', {
        name: 'defaultService',
        execute: () => {
            console.log('Executing default service');
        }
    });
    serviceManager.executeService('defaultService');
}

app.use('/agents', agentRouter);
app.use('/services', serviceRouter);

const exampleService = {
  name: 'exampleService',
  execute: () => {
    console.log('Executing example service');
  }
};

// Add the example service
serviceManager.addService(exampleService.name, exampleService);

// Execute the example service
serviceManager.executeService(exampleService.name);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

initializeApp();
startMainProcesses();
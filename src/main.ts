// src/main.ts

import express from 'express';
import { agentRouter } from './agents';
import { serviceRouter, ServiceManager } from './services';
import { ComfyUIService } from './services/comfyui-manager';
import { createHealthRouter } from './routes/health';

const app = express();
const port = process.env.PORT || 3000;
const comfyUIPort = process.env.COMFYUI_PORT || 8188;

app.use('/agents', agentRouter);
app.use('/services', serviceRouter);

const serviceManager = new ServiceManager();
const comfyUI = new ComfyUIService({
    port: Number(comfyUIPort),
    host: 'localhost'
});

// Add health check route
app.use('/health', createHealthRouter(comfyUI));

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

async function startServices() {
    try {
        // Initialize ComfyUI
        await comfyUI.start();
        console.log('ComfyUI started successfully');

        // Initialize ServiceManager
        await serviceManager.init();
        console.log('Service manager initialized');

        return true;
    } catch (error) {
        console.error('Failed to start services:', error);
        return false;
    }
}

async function shutdown() {
    console.log('Shutting down services...');
    try {
        await comfyUI.stop();
        console.log('ComfyUI stopped');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServices().then((success) => {
    if (success) {
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
            console.log(`ComfyUI running on port ${comfyUIPort}`);
        });
    } else {
        console.error('Failed to start services');
        process.exit(1);
    }
});
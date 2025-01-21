import { Router } from 'express';
import { ComfyUIService } from '../services/comfyui-manager';
import { HealthCheck, ServiceStatus } from '../types/health';

export function createHealthRouter(
    comfyUI: ComfyUIService
): Router {
    const router = Router();

    router.get('/', async (req, res) => {
        try {
            const health: HealthCheck = {
                status: 'up',
                timestamp: new Date().toISOString(),
                services: {
                    comfyui: await getComfyUIStatus(comfyUI),
                    express: { status: 'up', timestamp: new Date().toISOString() }
                }
            };
            
            health.status = determineOverallStatus(health.services);
            res.json(health);
        } catch (err: unknown) {
            const error = err as Error;
            res.status(500).json({
                status: 'down',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    return router;
}

function determineOverallStatus(services: Record<string, ServiceStatus>): 'up' | 'down' | 'degraded' {
    const statuses = Object.values(services).map(s => s.status);
    if (statuses.every(s => s === 'up')) return 'up';
    if (statuses.some(s => s === 'down')) return 'down';
    return 'degraded';
}

async function getComfyUIStatus(comfyUI: ComfyUIService): Promise<ServiceStatus> {
    return {
        status: comfyUI.isRunning() ? 'up' : 'down',
        timestamp: new Date().toISOString()
    };
}
export interface ServiceStatus {
    status: 'up' | 'down' | 'degraded';
    timestamp: string;
    details?: {
        message?: string;
        error?: string;
    };
}

export interface HealthCheck {
    status: 'up' | 'down' | 'degraded';
    timestamp: string;
    services: {
        comfyui: ServiceStatus;
        express: ServiceStatus;
    };
}
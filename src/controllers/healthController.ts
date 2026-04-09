import type { Request, Response } from 'express';

/**
 * Health check en GET /api/health (balanceadores AWS, monitoreo).
 * Sin autenticación; debe ser rápido y sin dependencias externas.
 */
export function getHealth(_req: Request, res: Response): void {
  res.status(200).json({
    status: 'ok',
    service: 'rait-backend',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
}

import type { Request, Response } from 'express';

/**
 * GET /api/health — load balancers and probes; no auth, no external I/O.
 */
export function getHealth(_req: Request, res: Response): void {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      service: 'rait-backend',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    },
  });
}

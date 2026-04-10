import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError';
import { loginWithCredentials } from '../services/authService';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (process.env.DEBUG_LOGIN === '1') {
      const b = req.body as Record<string, unknown>;
      // eslint-disable-next-line no-console
      console.log('Login attempt body:', {
        ...b,
        password: typeof b.password === 'string' ? '[redacted]' : b.password,
      });
    }

    const { email, password } = req.body as Record<string, unknown>;

    if (typeof email !== 'string' || typeof password !== 'string') {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        'Fields "email" and "password" are required as strings.'
      );
    }

    const result = await loginWithCredentials(email, password);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

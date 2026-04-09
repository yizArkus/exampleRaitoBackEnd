import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError';
import { loginWithCredentials } from '../services/authService';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as Record<string, unknown>;

    if (typeof email !== 'string' || typeof password !== 'string') {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        'Se requieren los campos email y password como texto.'
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

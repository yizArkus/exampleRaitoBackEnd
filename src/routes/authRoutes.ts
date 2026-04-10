import { Router } from 'express';
import { login } from '../controllers/authController';

export const authRoutes = Router();

authRoutes.get('/login', (_req, res) => {
  res.setHeader('Allow', 'POST');
  res.status(405).json({
    success: false,
    error: {
      code: 'METHOD_NOT_ALLOWED',
      message:
        'Use POST with Content-Type: application/json and body {"email":"...","password":"..."}.',
    },
  });
});

authRoutes.post('/login', login);

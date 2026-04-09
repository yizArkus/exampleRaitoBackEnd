import { Router } from 'express';
import { login } from '../controllers/authController';

export const authRoutes = Router();

/** El navegador hace GET al pegar la URL; el login real es POST con JSON. */
authRoutes.get('/login', (_req, res) => {
  res.setHeader('Allow', 'POST');
  res.status(405).json({
    success: false,
    error: {
      code: 'METHOD_NOT_ALLOWED',
      message:
        'El login requiere POST con Content-Type: application/json y body {"email","password"}. Usa Postman, Thunder Client, curl o Invoke-RestMethod en PowerShell.',
    },
  });
});

authRoutes.post('/login', login);

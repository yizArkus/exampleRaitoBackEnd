import bcrypt from 'bcrypt';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';
import { findUserByEmail } from '../models/userRepository';
import type { LoginSuccessPayload } from '../types/auth';
import { isValidEmail } from '../utils/validation';

export async function loginWithCredentials(
  email: string,
  password: string
): Promise<LoginSuccessPayload> {
  const trimmedEmail = email.trim();

  if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Email inválido o vacío.');
  }

  if (!password || password.length === 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'La contraseña es obligatoria.');
  }

  const user = await findUserByEmail(trimmedEmail);
  if (!user) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Credenciales incorrectas.');
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Credenciales incorrectas.');
  }

  const signOptions: SignOptions = {
    // jsonwebtoken tipa `expiresIn` con `ms.StringValue`; valor de env validado en runtime.
    expiresIn: env.jwtExpiresIn as NonNullable<SignOptions['expiresIn']>,
  };

  const token = jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, signOptions);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
    },
  };
}

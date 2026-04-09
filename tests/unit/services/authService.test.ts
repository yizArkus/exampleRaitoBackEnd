import { loginWithCredentials } from '../../../src/services/authService';

describe('loginWithCredentials', () => {
  const validEmail = 'user@example.com';
  const validPassword = 'password123';

  it('devuelve JWT y usuario público sin contraseña', async () => {
    const result = await loginWithCredentials(validEmail, validPassword);
    expect(result.token).toBeTruthy();
    expect(result.user).toEqual({
      id: 'usr_mock_001',
      email: validEmail,
    });
    expect((result.user as { passwordHash?: string }).passwordHash).toBeUndefined();
  });

  it('lanza 401 si el email no existe', async () => {
    await expect(loginWithCredentials('otro@example.com', validPassword)).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
    });
  });

  it('lanza 401 si la contraseña no coincide', async () => {
    await expect(loginWithCredentials(validEmail, 'mala')).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
    });
  });

  it('lanza 400 si el email es inválido', async () => {
    await expect(loginWithCredentials('no-es-email', validPassword)).rejects.toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
    });
  });

  it('lanza 400 si la contraseña está vacía', async () => {
    await expect(loginWithCredentials(validEmail, '')).rejects.toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
    });
  });
});

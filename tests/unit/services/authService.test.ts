jest.mock('../../../src/models/userRepository', () => ({
  findUserByEmail: jest.fn(),
}));

import { loginWithCredentials } from '../../../src/services/authService';
import { findUserByEmail } from '../../../src/models/userRepository';

/** Mismo hash que en el antiguo userMock (password123, bcrypt cost 10). */
const HASH_PASSWORD123 = '$2b$10$yf.WKRG6etFSo6FuNfnVMePGsirij3WXX3BBEPypfy1vmoHSkHKUC';

describe('loginWithCredentials', () => {
  const validEmail = 'user@example.com';
  const validPassword = 'password123';

  beforeEach(() => {
    jest.mocked(findUserByEmail).mockReset();
  });

  it('devuelve JWT y usuario público sin contraseña', async () => {
    jest.mocked(findUserByEmail).mockResolvedValue({
      id: 'usr_mock_001',
      email: validEmail,
      passwordHash: HASH_PASSWORD123,
    });

    const result = await loginWithCredentials(validEmail, validPassword);
    expect(result.token).toBeTruthy();
    expect(result.user).toEqual({
      id: 'usr_mock_001',
      email: validEmail,
    });
    expect((result.user as { passwordHash?: string }).passwordHash).toBeUndefined();
  });

  it('lanza 401 si el email no existe', async () => {
    jest.mocked(findUserByEmail).mockResolvedValue(null);

    await expect(loginWithCredentials('otro@example.com', validPassword)).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
    });
  });

  it('lanza 401 si la contraseña no coincide', async () => {
    jest.mocked(findUserByEmail).mockResolvedValue({
      id: '1',
      email: validEmail,
      passwordHash: HASH_PASSWORD123,
    });

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

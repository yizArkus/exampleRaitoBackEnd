jest.mock('../../../src/models/userRepository', () => ({
  findUserByEmail: jest.fn(),
}));

import { loginWithCredentials } from '../../../src/services/authService';
import { findUserByEmail } from '../../../src/models/userRepository';

const HASH_PASSWORD123 = '$2b$10$yf.WKRG6etFSo6FuNfnVMePGsirij3WXX3BBEPypfy1vmoHSkHKUC';

describe('loginWithCredentials', () => {
  const validEmail = 'user@example.com';
  const validPassword = 'password123';

  beforeEach(() => {
    jest.mocked(findUserByEmail).mockReset();
  });

  it('returns JWT and public user without password hash', async () => {
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

  it('throws 401 when email is unknown', async () => {
    jest.mocked(findUserByEmail).mockResolvedValue(null);

    await expect(loginWithCredentials('other@example.com', validPassword)).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
    });
  });

  it('throws 401 when password does not match', async () => {
    jest.mocked(findUserByEmail).mockResolvedValue({
      id: '1',
      email: validEmail,
      passwordHash: HASH_PASSWORD123,
    });

    await expect(loginWithCredentials(validEmail, 'wrong')).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
    });
  });

  it('throws 400 when email is invalid', async () => {
    await expect(loginWithCredentials('not-an-email', validPassword)).rejects.toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
    });
  });

  it('throws 400 when password is empty', async () => {
    await expect(loginWithCredentials(validEmail, '')).rejects.toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
    });
  });
});

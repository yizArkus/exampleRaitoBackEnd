import type { NextFunction, Request, Response } from 'express';
import { login } from '../../../src/controllers/authController';
import * as authService from '../../../src/services/authService';

jest.mock('../../../src/services/authService', () => ({
  loginWithCredentials: jest.fn(),
}));

describe('login', () => {
  const next = jest.fn() as NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('responde 200 cuando loginWithCredentials tiene éxito', async () => {
    const payload = {
      token: 'jwt',
      user: { id: 'u1', email: 'user@example.com' },
    };
    jest.mocked(authService.loginWithCredentials).mockResolvedValue(payload);

    const req = { body: { email: 'user@example.com', password: 'secret' } } as Request;
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const res = { status, json } as unknown as Response;

    await login(req, res, next);

    expect(authService.loginWithCredentials).toHaveBeenCalledWith('user@example.com', 'secret');
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ success: true, data: payload });
    expect(next).not.toHaveBeenCalled();
  });

  it('delega en next cuando email o password no son string', async () => {
    const req = { body: { email: 123, password: 'x' } } as unknown as Request;
    const res = { status: jest.fn(), json: jest.fn() } as unknown as Response;

    await login(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(authService.loginWithCredentials).not.toHaveBeenCalled();
  });
});
